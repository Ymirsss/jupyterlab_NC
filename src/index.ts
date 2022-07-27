import { DocumentRegistry } from '@jupyterlab/docregistry';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  INotebookModel,
  INotebookTracker,
  NotebookPanel 
} from '@jupyterlab/notebook';
import {
  ICommandPalette,
  showErrorMessage,
  ToolbarButton
} from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { IEditorTracker } from '@jupyterlab/fileeditor';
import { DisposableDelegate, IDisposable } from '@lumino/disposable';
import { LabIcon } from '@jupyterlab/ui-components';

import {
  JupyterlabFileEditorCodeOptimizer,
  JupyterlabNotebookCodeOptimizer
} from './deepcoder';
import JupyterlabDeepCoderClient from './client';
import { Constants } from './constants';

class JupyterLabDeepCoder
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  private app: JupyterFrontEnd;
  private tracker: INotebookTracker;
  private palette: ICommandPalette;
  private settingRegistry: ISettingRegistry;
  private menu: IMainMenu;
  private config: any;
  private editorTracker: IEditorTracker;
  private client: JupyterlabDeepCoderClient;
  private notebookCodeOptimizer: JupyterlabNotebookCodeOptimizer;
  private fileEditorCodeOptimizer: JupyterlabFileEditorCodeOptimizer;

  constructor(
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
    palette: ICommandPalette,
    settingRegistry: ISettingRegistry,
    menu: IMainMenu,
    editorTracker: IEditorTracker
  ) {
    this.app = app;
    this.tracker = tracker;
    this.editorTracker = editorTracker;
    this.palette = palette;
    this.settingRegistry = settingRegistry;
    this.menu = menu;
    this.client = new JupyterlabDeepCoderClient();
    this.notebookCodeOptimizer = new JupyterlabNotebookCodeOptimizer(
      this.client,
      this.tracker
    );
    this.fileEditorCodeOptimizer = new JupyterlabFileEditorCodeOptimizer(
      this.client,
      this.editorTracker
    );

    this.setupSettings();
    this.setupAllCommands();
    this.setupContextMenu();
    this.setupWidgetExtension();
  }

  public createNew(
    nb: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const self = this;
    const button = new ToolbarButton({
      tooltip: 'Optimize',
      icon: new LabIcon({
        name: Constants.OPTIMIZE_ALL_COMMAND,
        svgstr: Constants.ICON_FORMAT_ALL_SVG
      }),
      onClick: async () => {
        await self.notebookCodeOptimizer.optimizeAllCodeCells(
          this.config,
          undefined,
          nb.content
        );
      }
    });
    nb.toolbar.insertAfter(
      'cellType',
      this.app.commands.label(Constants.OPTIMIZE_ALL_COMMAND),
      button
    );
    nb.toolbar.insertItem(10, 'clearOutputs', button);

    context.saveState.connect(this.onSave, this);

    return new DisposableDelegate(() => {
      button.dispose();
    });
  }

  private async onSave(
    context: DocumentRegistry.IContext<INotebookModel>,
    state: DocumentRegistry.SaveState
  ) {
    if (state === 'started' && this.config.formatOnSave) {
      await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
    }
  }

  private setupWidgetExtension() {
    this.app.docRegistry.addWidgetExtension('Notebook', this);
  }

  private setupContextMenu() {
    this.app.contextMenu.addItem({
      command: Constants.OPTIMIZE_COMMAND,
      selector: '.jp-Notebook'
    });
  }

  private setupAllCommands() {
    this.client.getAvailableFormatters().then(data => {
      const formatters = JSON.parse(data).formatters;
      const menuGroup: Array<{ command: string }> = [];
      Object.keys(formatters).forEach(formatter => {
        if (formatters[formatter].enabled) {
          const command = `${Constants.SHORT_PLUGIN_NAME}:${formatter}`;
          this.setupCommand(formatter, formatters[formatter].label, command);
          menuGroup.push({ command });
        }
      });
      this.menu.editMenu.addGroup(menuGroup);
    });

    this.app.commands.addCommand(Constants.OPTIMIZE_COMMAND, {
      execute: async () => {
        await this.notebookCodeOptimizer.optimizeSelectedCodeCells(this.config);
      },
      // TODO: Add back isVisible
      label: 'Format cell'
    });
    this.app.commands.addCommand(Constants.OPTIMIZE_ALL_COMMAND, {
      execute: async () => {
        await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
      },
      iconClass: Constants.ICON_FORMAT_ALL,
      iconLabel: 'Optimize code'
      // TODO: Add back isVisible
    });
  }

  private setupSettings() {
    const self = this;
    console.log("Constants.SETTINGS_SECTION",Constants.SETTINGS_SECTION)
    console.log("settingRegistry",this.settingRegistry)
    if(this.settingRegistry){
      Promise.all([this.settingRegistry.load(Constants.SETTINGS_SECTION)])
        .then(([settings]) => {
          function onSettingsUpdated(jsettings: ISettingRegistry.ISettings) {
            self.config = jsettings.composite;
          }
          settings.changed.connect(onSettingsUpdated);
          onSettingsUpdated(settings);
        })
        .catch((error: Error) => {
          void showErrorMessage('Jupyterlab Code Formatter Error', error);
        });
    }
  }

  private setupCommand(name: string, label: string, command: string) {
    this.app.commands.addCommand(command, {
      execute: async () => {
        for (let optimizer of [
          this.notebookCodeOptimizer,
          this.fileEditorCodeOptimizer
        ]) {
          const widget = this.app.shell.currentWidget;
          if(widget != null){
            if (optimizer.applicable(name, widget)) {
              await optimizer.optimizeAction(this.config, name);
            }
          } 
        }
      },
      isVisible: () => {
        for (let optimizer of [
          this.notebookCodeOptimizer,
          this.fileEditorCodeOptimizer
        ]) {
          const widget = this.app.shell.currentWidget;
          if(widget == null) {
            return false;
          }
          if (optimizer.applicable(name, widget)) {
            return true;
          }
        }
        return false;
      },
      label
    });
    this.palette.addItem({ command, category: Constants.COMMAND_SECTION_NAME });
  }

}


/**
 * Initialization data for the deepcoder-jupyterlab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'deepcoder-jupyterlab:plugin',
  autoStart: true,
  requires: [ICommandPalette,ISettingRegistry],
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    tracker: INotebookTracker,
    settingRegistry: ISettingRegistry,
    menu: IMainMenu,
    editorTracker: IEditorTracker
  ) => {
    new JupyterLabDeepCoder(
      app,
      tracker,
      palette,
      settingRegistry,
      menu,
      editorTracker
    );
    console.log('JupyterLab extension jupyterlab_apod is activated!');
    console.log('ICommandPalette:', palette);
  }
};

export default plugin;
