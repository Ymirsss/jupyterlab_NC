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
  ToolbarButton
} from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { DisposableDelegate, IDisposable } from '@lumino/disposable';
import { LabIcon } from '@jupyterlab/ui-components';
import { Menu } from '@lumino/widgets';

import {
  JupyterlabNotebookCodeOptimizer
} from './deepcoder';
import JupyterlabDeepCoderClient from './client';
import { Constants } from './constants';

class JupyterLabDeepCoder
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  private app: JupyterFrontEnd;
  private tracker: INotebookTracker;
  private menu: IMainMenu;
  private config: any;
  private client: JupyterlabDeepCoderClient;
  private notebookCodeOptimizer: JupyterlabNotebookCodeOptimizer;

  constructor(
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
    menu: IMainMenu,
  ) {
    this.app = app;
    this.tracker = tracker;
    this.menu = menu;
    this.client = new JupyterlabDeepCoderClient();
    this.notebookCodeOptimizer = new JupyterlabNotebookCodeOptimizer(
      this.client,
      this.tracker
    );
    console.log("Begin----");
    console.log("Finish setupSettings");
    this.setupAllCommands();
    console.log("Finish setupAllCommands");
    this.setupContextMenu();
    console.log("Finish setupContextMenu");
    this.setupWidgetExtension();
    console.log("Finish setupWidgetExtension");
  }

  public createNew(
    nb: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const button = new ToolbarButton({
      tooltip: 'Optimize',
      icon: new LabIcon({
        name: Constants.OPTIMIZE_ALL_COMMAND,
        svgstr: Constants.ICON_FORMAT_ALL_SVG
      }),
      onClick: async () => {

        console.log("It's an empty button.")
      }
    });
    nb.toolbar.addItem("Optimize Code",button)
    
    nb.toolbar.insertItem(10, 'clearOutputs', button);


    return new DisposableDelegate(() => {
      button.dispose();
    });
  }

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

    this.app.commands.addCommand(Constants.OPTIMIZE_ALL_COMMAND, {
      execute: async () => {
        await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
      },
      iconClass: Constants.ICON_FORMAT_ALL,
      iconLabel: 'Optimize code'
    });
    this.app.commands.addCommand(Constants.OPTIMIZE_AMP_COMMAND, {
      execute: async () => {
        const currentwidget = this.app.shell.currentWidget;
        if(currentwidget){
        currentwidget.addClass('lds-ripple');
        }
      await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config,"pytorch_mixed_precision_cpu");
      if(currentwidget){
        currentwidget.removeClass('lds-ripple');}
    },
      label: 'Automatic Mixed Precison'
    });
    this.app.commands.addCommand(Constants.OPTIMIZE_INC_DQ_COMMAND, {
      execute: async () => {
        const currentwidget = this.app.shell.currentWidget;
        if(currentwidget){
        currentwidget.addClass('lds-ripple');
        }
      await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config,"pytorch_inc_dynamic_quant");
      if(currentwidget){
        currentwidget.removeClass('lds-ripple');}
    },
      label: 'INC Dynamic Quantization (INT8) '
    });
    this.app.commands.addCommand(Constants.OPTIMIZE_JIT_COMMAND, {
      execute: async () => {
        const currentwidget = this.app.shell.currentWidget;
        if(currentwidget){
        currentwidget.addClass('lds-ripple');
        }
      await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config,"pytorch_jit_script");
      if(currentwidget){
        currentwidget.removeClass('lds-ripple');}
    },
      label: 'JIT'
    });
    this.app.commands.addCommand(Constants.OPTIMIZE_CL_COMMAND, {
      execute: async () => {
        const currentwidget = this.app.shell.currentWidget;
        if(currentwidget){
        currentwidget.addClass('lds-ripple');
        }
      await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config,"pytorch_channels_last");
      if(currentwidget){
        currentwidget.removeClass('lds-ripple');}
    },
      label: 'Channels Last (memory fomat)'
    });
    this.app.commands.addCommand(Constants.OPTIMIZE_CToC_COMMAND, {
      execute: async () => {
          const currentwidget = this.app.shell.currentWidget;
          if(currentwidget){
          currentwidget.addClass('lds-ripple');
          }
        await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config,"pytorch_cuda_to_cpu");
        if(currentwidget){
          currentwidget.removeClass('lds-ripple');}
      },
      label: 'CUDA to CPU'
    });
    
    // });
  }

}


/**
 * Initialization data for the deepcoder-jupyterlab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'deepcoder-jupyterlab:plugin',
  autoStart: true,
  requires: [ICommandPalette,INotebookTracker,IMainMenu],
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    tracker: INotebookTracker,
    menu: IMainMenu,
  ) => {
    new JupyterLabDeepCoder(
      app,
      tracker,
      menu,
    );
    
    console.log('JupyterLab extension jupyterlab_apod is activated!');
    console.log('ICommandPalette:', palette);
    console.log('document...',document)
  }
};

export default plugin;
