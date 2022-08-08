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
  // showErrorMessage,
  ToolbarButton
} from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IMainMenu } from '@jupyterlab/mainmenu';
// import { IEditorTracker } from '@jupyterlab/fileeditor';
import { DisposableDelegate, IDisposable } from '@lumino/disposable';
import { LabIcon } from '@jupyterlab/ui-components';
import { Menu } from '@lumino/widgets';
//import { Widget } from '@lumino/widgets';

import {
  // JupyterlabFileEditorCodeOptimizer,
  JupyterlabNotebookCodeOptimizer
} from './deepcoder';
import JupyterlabDeepCoderClient from './client';
import { Constants } from './constants';

class JupyterLabDeepCoder
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  private app: JupyterFrontEnd;
  private tracker: INotebookTracker;
  // private palette: ICommandPalette;
  // private settingRegistry: ISettingRegistry;
  private menu: IMainMenu;
  private config: any;
  // private editorTracker: IEditorTracker;
  private client: JupyterlabDeepCoderClient;
  private notebookCodeOptimizer: JupyterlabNotebookCodeOptimizer;
  //private currentwidget: Widget | null';
  // private fileEditorCodeOptimizer: JupyterlabFileEditorCodeOptimizer;

  constructor(
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
    // palette: ICommandPalette,
    // settingRegistry: ISettingRegistry,
    menu: IMainMenu,
    // editorTracker: IEditorTracker
  ) {
    this.app = app;
    this.tracker = tracker;
    // this.editorTracker = editorTracker;
    // this.palette = palette;
    // this.settingRegistry = settingRegistry;
    this.menu = menu;
    this.client = new JupyterlabDeepCoderClient();
    this.notebookCodeOptimizer = new JupyterlabNotebookCodeOptimizer(
      this.client,
      this.tracker
    );
    // this.fileEditorCodeOptimizer = new JupyterlabFileEditorCodeOptimizer(
    //   this.client,
    //   this.editorTracker
    // );
    console.log("Begin----");
    // this.setupSettings();
    console.log("Finish setupSettings");
    this.setupAllCommands();
    console.log("Finish setupAllCommands");
    this.setupContextMenu();
    console.log("Finish setupContextMenu");
    this.setupWidgetExtension();
    console.log("Finish setupWidgetExtension");
    //this.currentwidget = new Widget();
    //this.loading.addClass('lds-ripple');
    //this.loading.id = "loading circle"
    //this.loading.title.label = "loading"
  }

  public createNew(
    nb: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    // const self = this;
    const button = new ToolbarButton({
      tooltip: 'Optimize',
      icon: new LabIcon({
        name: Constants.OPTIMIZE_ALL_COMMAND,
        svgstr: Constants.ICON_FORMAT_ALL_SVG
      }),
      onClick: async () => {
        // await self.notebookCodeOptimizer.optimizeAllCodeCells(
        //   this.config,
        //   undefined,
        //   nb.content
        // );
        console.log("It's an empty button.")
      }
    });
    nb.toolbar.addItem("Optimize Code",button)
    // nb.toolbar.insertAfter(
    //   'cellType',
    //   this.app.commands.label(Constants.OPTIMIZE_ALL_COMMAND),
    //   button
    // );
    nb.toolbar.insertItem(10, 'clearOutputs', button);

    // context.saveState.connect(this.onSave, this);

    return new DisposableDelegate(() => {
      button.dispose();
    });
  }

  // private async onSave(
  //   context: DocumentRegistry.IContext<INotebookModel>,
  //   state: DocumentRegistry.SaveState
  // ) {
  //   if (state === 'started' && this.config.formatOnSave) {
  //     await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
  //   }
  // }

  private setupWidgetExtension() {
    this.app.docRegistry.addWidgetExtension('Notebook', this);
  }

  private setupContextMenu() {
    this.app.contextMenu.addItem({
      command: Constants.OPTIMIZE_COMMAND,
      selector: '.jp-Notebook'
    });
    const commands = this.app.commands;
    const deepcoderMenu = new Menu({ commands });
    deepcoderMenu.title.label = 'NeuralCoder';
    /*workaround 1: single-framework*/
    deepcoderMenu.title.label
    deepcoderMenu.addItem({ command: Constants.OPTIMIZE_AMP_COMMAND });
    deepcoderMenu.addItem({ type: 'separator' });
    deepcoderMenu.addItem({ command: Constants.OPTIMIZE_INC_DQ_COMMAND });
    deepcoderMenu.addItem({ type: 'separator' });
    deepcoderMenu.addItem({ command: Constants.OPTIMIZE_JIT_COMMAND });
    deepcoderMenu.addItem({ type: 'separator' });
    deepcoderMenu.addItem({ command: Constants.OPTIMIZE_CL_COMMAND });
    deepcoderMenu.addItem({ type: 'separator' });
    deepcoderMenu.addItem({ command: Constants.OPTIMIZE_CToC_COMMAND });
    deepcoderMenu.addItem({ type: 'separator' });
    deepcoderMenu.addItem({ command: Constants.OPTIMIZE_PROFILER_COMMAND });

    /*****workaround 2:multi-framework******/
    // const amp_submenu = new Menu({commands})
    // amp_submenu.title.label = 'Automatic Mixed Precison(BF16)'
    // amp_submenu.addItem({args:{"feature":"Automatic Mixed Precison"},command: Constants.OPTIMIZE_PT_COMMAND})
    // amp_submenu.addItem({args:{"feature":"Automatic Mixed Precison"},command: Constants.OPTIMIZE_TF_COMMAND})
    // amp_submenu.addItem({args:{"feature":"Automatic Mixed Precison"},command: Constants.OPTIMIZE_KERAS_COMMAND})
    // deepcoderMenu.addItem({type:'submenu', submenu:amp_submenu})
    // const inc_dq_submenu = new Menu({commands})
    // inc_dq_submenu.title.label = 'INC Dynamic Quantization(INT8)'
    // inc_dq_submenu.addItem({args:{"feature":"INC Dynamic Quantization"},command: Constants.OPTIMIZE_PT_COMMAND})
    // inc_dq_submenu.addItem({args:{"feature":"Automatic Mixed Precison"},command: Constants.OPTIMIZE_TF_COMMAND})
    // inc_dq_submenu.addItem({args:{"feature":"Automatic Mixed Precison"},command: Constants.OPTIMIZE_KERAS_COMMAND})
    // deepcoderMenu.addItem({type:'submenu', submenu:inc_dq_submenu})
    // const inc8_static_submenu = new Menu({commands})
    // inc8_static_submenu.title.label = 'INT8 STATIC Quantization  '
    // inc8_static_submenu.addItem({args:{"feature":"INC Dynamic Quantization"},command: Constants.OPTIMIZE_PT_COMMAND})
    // inc8_static_submenu.addItem({args:{"feature":"INC Dynamic Quantization"},command: Constants.OPTIMIZE_TF_COMMAND})
    // deepcoderMenu.addItem({type:'submenu', submenu:inc_dq_submenu})
    // const jit_trace_submenu = new Menu({commands})
    // inc8_static_submenu.title.label = 'INT8 STATIC Quantization  '
    // inc8_static_submenu.addItem({args:{"feature":"INC Dynamic Quantization"},command: Constants.OPTIMIZE_PT_COMMAND})
    // inc8_static_submenu.addItem({args:{"feature":"INC Dynamic Quantization"},command: Constants.OPTIMIZE_TF_COMMAND})
    // deepcoderMenu.addItem({type:'submenu', submenu:inc_dq_submenu})

    this.menu.addMenu(deepcoderMenu)
    
  }

  private setupAllCommands() {
    // this.client.getAvailableFormatters().then(data => {
    //   const formatters = JSON.parse(data).formatters;
    //   const menuGroup: Array<{ command: string }> = [];
    //   Object.keys(formatters).forEach(formatter => {
    //     if (formatters[formatter].enabled) {
    //       const command = `${Constants.SHORT_PLUGIN_NAME}:${formatter}`;
    //       this.setupCommand(formatter, formatters[formatter].label, command);
    //       menuGroup.push({ command });
    //     }
    //   });
    //   this.menu.editMenu.addGroup(menuGroup);
    // });

    // this.app.commands.addCommand(Constants.OPTIMIZE_COMMAND, {
    //   execute: async () => {
    //     await this.notebookCodeOptimizer.optimizeSelectedCodeCells(this.config);
    //   },
    //   // TODO: Add back isVisible
    //   label: 'Format cell'
    // });
    //const loading_bar = document.createElement('lds-ripple')
    this.app.commands.addCommand(Constants.OPTIMIZE_ALL_COMMAND, {
      execute: async () => {
        await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
      },
      iconClass: Constants.ICON_FORMAT_ALL,
      iconLabel: 'Optimize code'
      // TODO: Add back isVisible
    });
    this.app.commands.addCommand(Constants.OPTIMIZE_AMP_COMMAND, {
      execute: async () => {
        await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
      },
      label: 'Automatic Mixed Precison'
      // TODO: Add back isVisible
    });
    this.app.commands.addCommand(Constants.OPTIMIZE_INC_DQ_COMMAND, {
      execute: async () => {
        await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
      },
      label: 'INC Dynamic Quantization (INT8) '
      // TODO: Add back isVisible
    });
    this.app.commands.addCommand(Constants.OPTIMIZE_JIT_COMMAND, {
      execute: async () => {
        await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
      },
      label: 'JIT'
      // TODO: Add back isVisible
    });
    this.app.commands.addCommand(Constants.OPTIMIZE_CL_COMMAND, {
      execute: async () => {
        await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
      },
      label: 'Channels Last (memory fomat)'
      // TODO: Add back isVisible
    });
    this.app.commands.addCommand(Constants.OPTIMIZE_CToC_COMMAND, {
      execute: async () => {
          const currentwidget = this.app.shell.currentWidget;
          if(currentwidget){
            //currentwidget.node.appendChild(loading_bar);
            //console.log("loading_bar:", loading_bar)
           //if (!this.loading.isAttached) {
          // Attach the widget to the main work area if it's not there
            //this.app.shell.add(this.loading, 'main');
          //}
          // Activate the widget
          //this.app.shell.activateById(this.loading.id);
          //console.log("currentwidget:", currentwidget)
          currentwidget.addClass('lds-ripple');
          }
        //this.loading.show();
        await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config,"pytorch_cuda_to_cpu");
        if(currentwidget){
          currentwidget.removeClass('lds-ripple');}
        //console.log("execute document",document)
        //this.loading.close();
      },
      label: 'CUDA to CPU'
      // TODO: Add back isVisible
    });
    // this.app.commands.addCommand(Constants.OPTIMIZE_PROFILER_COMMAND, {
    //   execute: async () => {
    //     await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
    //   },
    //   label: 'Profiler'
    //   // TODO: Add back isVisible
    // });
  }

  // private setupSettings() {
  //   const self = this;
  //   console.log("Constants.SETTINGS_SECTION",Constants.SETTINGS_SECTION)
  //   console.log("settingRegistry",this.settingRegistry)
  //   if(this.settingRegistry){
  //     Promise.all([this.settingRegistry.load(Constants.SETTINGS_SECTION)])
  //       .then(([settings]) => {
  //         function onSettingsUpdated(jsettings: ISettingRegistry.ISettings) {
  //           self.config = jsettings.composite;
  //         }
  //         settings.changed.connect(onSettingsUpdated);
  //         onSettingsUpdated(settings);
  //       })
  //       .catch((error: Error) => {
  //         void showErrorMessage('Jupyterlab Code Formatter Error', error);
  //       });
  //   }
  // }

//   private setupCommand(name: string, label: string, command: string) {
//     this.app.commands.addCommand(command, {
//       execute: async () => {
//         for (let optimizer of [
//           this.notebookCodeOptimizer,
//           this.fileEditorCodeOptimizer
//         ]) {
//           const widget = this.app.shell.currentWidget;
//           if(widget != null){
//             if (optimizer.applicable(name, widget)) {
//               await optimizer.optimizeAction(this.config, name);
//             }
//           } 
//         }
//       },
//       isVisible: () => {
//         for (let optimizer of [
//           this.notebookCodeOptimizer,
//           this.fileEditorCodeOptimizer
//         ]) {
//           const widget = this.app.shell.currentWidget;
//           if(widget == null) {
//             return false;
//           }
//           if (optimizer.applicable(name, widget)) {
//             return true;
//           }
//         }
//         return false;
//       },
//       label
//     });
//     this.palette.addItem({ command, category: Constants.COMMAND_SECTION_NAME });
//   }

}


/**
 * Initialization data for the deepcoder-jupyterlab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'deepcoder-jupyterlab:plugin',
  autoStart: true,
  // requires: [ICommandPalette,INotebookTracker,ISettingRegistry,IMainMenu,IEditorTracker],
  requires: [ICommandPalette,INotebookTracker,IMainMenu],
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    tracker: INotebookTracker,
    // settingRegistry: ISettingRegistry,
    menu: IMainMenu,
    // editorTracker: IEditorTracker
  ) => {
    new JupyterLabDeepCoder(
      app,
      tracker,
      // palette
      // settingRegistry,
      menu,
      // editorTracker
    );
    
    console.log('JupyterLab extension jupyterlab_apod is activated!');
    console.log('ICommandPalette:', palette);
    console.log('document...',document)
  }
};

export default plugin;
