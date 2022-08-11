import { DocumentRegistry } from '@jupyterlab/docregistry';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  INotebookModel,
  INotebookTracker,
  NotebookPanel, 
} from '@jupyterlab/notebook';
import {
  ICommandPalette,
  ToolbarButton,
} from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IMainMenu } from '@jupyterlab/mainmenu';
// import { DisposableDelegate, IDisposable } from '@lumino/disposable';
import { LabIcon } from '@jupyterlab/ui-components';
import { Widget} from '@lumino/widgets';
import {
  JupyterlabNotebookCodeOptimizer
} from './deepcoder';
import JupyterlabDeepCoderClient from './client';
import { Constants } from './constants';

class JupyterLabDeepCoder
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  private app: JupyterFrontEnd;
  private tracker: INotebookTracker;

  private config: any;
  private client: JupyterlabDeepCoderClient;
  private notebookCodeOptimizer: JupyterlabNotebookCodeOptimizer;
  private panel: NotebookPanel;
  constructor(
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
    menu: IMainMenu,
    panel: NotebookPanel
  ) {
    this.app = app;
    this.tracker = tracker;

    this.panel = panel;
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
  ) {
    this.panel = nb;
    const logo = document.createElement("p");
    logo.setAttribute("class","font")
    logo.innerText = "NeuralCoder:";
    const div = document.createElement("div");
    div.setAttribute("class","wrapper")
    const span = document.createElement("span");
    span.setAttribute("class","f1ozlkqi")
    span.innerHTML = Constants.SVG;
    const selector = document.createElement("select");
   
    selector.setAttribute("class","aselector")
    selector.id = "NeuralCoder"
    const option0 = document.createElement("option");
    option0.value = "Automatic Mixed Precison";
    option0.innerText = "-";
    const option1 = document.createElement("option");
    option1.value = "pytorch_mixed_precision_cpu";
    option1.innerText = "Automatic Mixed Precison";
    option1.selected=true;
    const option2 = document.createElement("option");
    option2.value = "pytorch_inc_dynamic_quant";
    option2.innerText = "INC Dynamic Quantization (INT8)";
    const option3 = document.createElement("option");
    option3.value = "pytorch_jit_script";
    option3.innerText = "JIT";
    const option4 = document.createElement("option");
    option4.value = "pytorch_channels_last";
    option4.innerText = "Channels Last (memory fomat)";
    const option5 = document.createElement("option");
    option5.value = "pytorch_cuda_to_cpu";
    option5.innerText = "CUDA to CPU";

    
    selector.options.add(option0)
    selector.options.add(option1)
    selector.options.add(option2)
    selector.options.add(option3)
    selector.options.add(option4)
    selector.options.add(option5)

    div.appendChild(selector)
    div.appendChild(span)
    // selector.insertAdjacentElement('beforeend',span)
    const selector_widget = new Widget();
    selector_widget.node.appendChild(div)
    const logo_widget = new Widget();
    logo_widget.node.appendChild(logo)

   
    const button = new ToolbarButton({
      tooltip: 'optimizing',
      icon: new LabIcon({
        name: Constants.OPTIMIZE_ALL_COMMAND,
        svgstr: Constants.ICON_FORMAT_ALL_SVG
      }),
      onClick: async () => {
        console.log("It's an empty button.")
      }
    });
    let panel = this.panel;
    let notebookCodeOptimizer = this.notebookCodeOptimizer;
    let config = this.config;
    selector.addEventListener('change',(event) =>async () => {
      console.log("change!!!!!!!!!!!!!!!!!")
      console.log(selector.options[selector.selectedIndex].value)
      if(button.isHidden){button.show();}
      else{panel.toolbar.insertItem(10,"optimize",button);}
      await notebookCodeOptimizer.optimizeAllCodeCells(config,selector.options[selector.selectedIndex].value);
      button.hide();
    })
    // selector.addEventListener('click',(event) =>async () => {
    //   console.log("click!!!!!!!!!!!!!!!!!")
    //   console.log(selector.options[selector.selectedIndex].value)
    //   if(button.isHidden){button.show();}
    //   else{panel.toolbar.insertItem(10,"optimize",button);}
    //   await notebookCodeOptimizer.optimizeAllCodeCells(config,selector.options[selector.selectedIndex].value);
    //   button.hide();
    // })
    selector.onchange = async function(){ 
      console.log("onchange!!!!!!!!!!!!!!!!!")
      console.log(selector.options[selector.selectedIndex].value)
      if(button.isHidden){button.show();}
      else{panel.toolbar.insertItem(10,"optimize",button);}
      await notebookCodeOptimizer.optimizeAllCodeCells(config,selector.options[selector.selectedIndex].value);
      button.hide();
      
    }
    // option2.onclick = function(){ 
    //   async () => {
    //     console.log("option2!!!!!!!!!!!!!!!!!")
    //     console.log(selector.options[selector.selectedIndex].value)
    //     if(button.isHidden){button.show();}
    //     else{panel.toolbar.insertItem(10,"optimize",button);}
    //     await notebookCodeOptimizer.optimizeAllCodeCells(config,selector.options[selector.selectedIndex].value);
    //     button.hide();
    //   }
    // }
    // option2.click = function(){ 
    //   console.log("option2click!!!!!!!!!!!!!!!!!")
    //   console.log(selector.options[selector.selectedIndex].value)
    // }
    // const button = new ToolbarButton({
    //   tooltip: 'lueluelue',
    //   icon: new LabIcon({
    //     name: Constants.OPTIMIZE_ALL_COMMAND,
    //     svgstr: Constants.ICON_FORMAT_ALL_SVG
    //   }),
    //   onClick: async () => {
    //     console.log("It's an empty button.")
    //   }
    // });
    
    // button.node.addEventListener(
    //   "DOMNodeInserted",
    //   () => {
    //     let jovian_button: any = button.node.firstChild;
    //     jovian_button.firstChild.innerText = "Commit";
    //   },
    //   {
    //     once: true,
    //     passive: true,
    //     capture: true,
    //   }
    // );


    // let loading_icon = document.createElement('lds-ripple')
    // const loading = new Widget();
    // loading.addClass('lds-ripple');
    // nb.toolbar.insertItem(10,"optimizing",button)
    nb.toolbar.insertItem(11,"nc",logo_widget)
    selector_widget.addClass("aselector")
    nb.toolbar.insertItem(12,"loading",selector_widget)
    console.log("???")
    // nb.toolbar.insertItem(10, 'clearOutputs', button);


    // return new DisposableDelegate(() => {
    //   button.dispose();
    // });
  }
 
  private setupWidgetExtension() {
    this.app.docRegistry.addWidgetExtension('Notebook', this);
  }

  private setupContextMenu() {
    this.app.contextMenu.addItem({
      command: Constants.OPTIMIZE_COMMAND,
      selector: '.jp-Notebook'
    });
    // const commands = this.app.commands;
    // const deepcoderMenu = new Menu({ commands });
    // deepcoderMenu.title.label = 'NeuralCoder';
    // /*workaround 1: single-framework*/
    // deepcoderMenu.addItem({ command: Constants.OPTIMIZE_AMP_COMMAND });
    // deepcoderMenu.addItem({ type: 'separator' });
    // deepcoderMenu.addItem({ command: Constants.OPTIMIZE_INC_DQ_COMMAND });
    // deepcoderMenu.addItem({ type: 'separator' });
    // deepcoderMenu.addItem({ command: Constants.OPTIMIZE_JIT_COMMAND });
    // deepcoderMenu.addItem({ type: 'separator' });
    // deepcoderMenu.addItem({ command: Constants.OPTIMIZE_CL_COMMAND });
    // deepcoderMenu.addItem({ type: 'separator' });
    // deepcoderMenu.addItem({ command: Constants.OPTIMIZE_CToC_COMMAND });
    // deepcoderMenu.addItem({ type: 'separator' });
    // deepcoderMenu.addItem({ command: Constants.OPTIMIZE_PROFILER_COMMAND });

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

    // this.menu.addMenu(deepcoderMenu);
 
  }


  private setupAllCommands() {
    // const button = new ToolbarButton({
    //   tooltip: 'optimizing',
    //   icon: new LabIcon({
    //     name: Constants.OPTIMIZE_ALL_COMMAND,
    //     svgstr: Constants.ICON_FORMAT_ALL_SVG
    //   }),
    //   onClick: async () => {
    //     console.log("It's an empty button.")
    //   }
    // });
    // this.app.commands.addCommand(Constants.OPTIMIZE_ALL_COMMAND, {
    //   execute: async () => {
    //     await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
    //   },
    //   iconClass: Constants.ICON_FORMAT_ALL,
    //   iconLabel: 'hahaha'
    // });
    // this.app.commands.addCommand(Constants.OPTIMIZE_AMP_COMMAND, {
    //   execute: async () => {
    //     // const currentwidget = this.app.shell.currentWidget;
    //     // if(currentwidget){
    //     // currentwidget.addClass('lds-ripple');
        
    //     // }
    //   if(button.isHidden){button.show();}
    //   else{this.panel.toolbar.insertItem(10,"optimize",button);}
    //   await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config,"pytorch_mixed_precision_cpu");
    //   // if(currentwidget){
    //   //   currentwidget.removeClass('lds-ripple');}
    //   button.hide();

    // },
    //   label: 'Automatic Mixed Precison'
    // });
    // this.app.commands.addCommand(Constants.OPTIMIZE_INC_DQ_COMMAND, {
    //   execute: async () => {
    //   if(button.isHidden){button.show();}
    //   else{this.panel.toolbar.insertItem(10,"optimize",button);}
    //   await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config,"pytorch_inc_dynamic_quant");
    //   button.hide();
    // },
    //   label: 'INC Dynamic Quantization (INT8) '
    // });
    // this.app.commands.addCommand(Constants.OPTIMIZE_JIT_COMMAND, {
    //   execute: async () => {
    //     if(button.isHidden){button.show();}
    //     else{this.panel.toolbar.insertItem(10,"optimize",button);}
    //   await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config,"pytorch_jit_script");
    //   button.hide();
    // },
    //   label: 'JIT'
    // });
    // this.app.commands.addCommand(Constants.OPTIMIZE_CL_COMMAND, {
    //   execute: async () => {
    //     if(button.isHidden){button.show();}
    //     else{this.panel.toolbar.insertItem(10,"optimize",button);}
    //   await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config,"pytorch_channels_last");
    //   button.hide();
    // },
    //   label: 'Channels Last (memory fomat)'
    // });
    // this.app.commands.addCommand(Constants.OPTIMIZE_CToC_COMMAND, {
    //   execute: async () => {
    //     if(button.isHidden){button.show();}
    //     else{this.panel.toolbar.insertItem(10,"optimize",button);}        
    //     await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config,"pytorch_cuda_to_cpu");
    //     button.hide();
    //   },
    //   label: 'CUDA to CPU'
    // });
  
  
    
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
    panel: NotebookPanel
  ) => {
    new JupyterLabDeepCoder(
      app,
      tracker,
      menu,
      panel
    );
    
    console.log('JupyterLab extension jupyterlab_apod is activated!');
    console.log('ICommandPalette:', palette);
    console.log('document...',document)
  }
};

export default plugin;
