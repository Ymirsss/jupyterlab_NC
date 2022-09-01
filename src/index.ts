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
  // ICommandPalette,
  ToolbarButton,
  showDialog,
  Dialog
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

  private config: string;
  private client: JupyterlabDeepCoderClient;
  private notebookCodeOptimizer: JupyterlabNotebookCodeOptimizer;
  // private panel: NotebookPanel;
  constructor(
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
    // panel: NotebookPanel
  ) {
    this.app = app;
    this.tracker = tracker;

    // this.panel = panel;
    this.client = new JupyterlabDeepCoderClient();
    this.notebookCodeOptimizer = new JupyterlabNotebookCodeOptimizer(
      this.client,
      this.tracker
    );
    this.setupWidgetExtension();
    this.config = ''
  }

  public createNew(
    nb: NotebookPanel,
  ) {
    // this.panel = nb;
    const svg = document.createElement("svg")
    svg.innerHTML = Constants.ICON_FORMAT_ALL_SVG
    const run_svg = document.createElement("svg")
    run_svg.innerHTML = Constants.ICON_RUN
    const div = document.createElement("div");
    div.setAttribute("class","wrapper")
    const span = document.createElement("span");
    span.setAttribute("class","f1ozlkqi")
    span.innerHTML = Constants.SVG;
    const selector = document.createElement("select");
    selector.setAttribute("class","aselector")
    selector.id = "NeuralCoder"
    const option1 = document.createElement("option");
    option1.value = "pytorch_inc_static_quant_fx";
    option1.innerText = "Intel INT8 (Static)";
    option1.selected=true;
    const option2 = document.createElement("option");
    option2.value = "pytorch_inc_dynamic_quant";
    option2.innerText = "Intel INT8 (Dynamic)";
    const option3 = document.createElement("option");
    option3.value = "pytorch_inc_bf16";
    option3.innerText = "Intel BF16";
    const option4 = document.createElement("option");
    option4.value = "auto-quant";
    option4.innerText = "Auto";
    selector.options.add(option1)
    selector.options.add(option2)
    selector.options.add(option3)
    selector.options.add(option4)
    div.appendChild(selector)
    div.appendChild(span)
    const selector_widget = new Widget();
    selector_widget.node.appendChild(div)
    selector_widget.addClass("aselector")
    // let panel = this.panel;
    let notebookCodeOptimizer = this.notebookCodeOptimizer;
    let config = this.config;
    

    const dia_input = document.createElement("input")
    const dia_widget = new Widget();
    dia_widget.node.appendChild(dia_input)
    dia_widget.addClass("dialog")

    const run_button = new ToolbarButton({
      tooltip: 'NeuralCoder',
      icon: new LabIcon({
        name: "run",
        svgstr:Constants.ICON_RUN
      }),
      onClick: async function (){  
        run_button.node.firstChild?.firstChild?.firstChild?.firstChild?.replaceWith(svg)
        console.log("user's selecting feature")
        console.log(selector.options[selector.selectedIndex].value)
        if (selector.options[selector.selectedIndex].value === 'auto-quant'){
            await showDialog({
              title:'Please input execute parameters:',
              body: dia_widget,
              buttons: [Dialog.okButton({ label: 'Confirm' })]
            }).then(result => {
               if (result.button.accept) {
                 console.log("recieved args body, ", dia_input.value)
                 config = dia_input.value
                 }
            })
          }
        await notebookCodeOptimizer.optimizeAllCodeCells(config,selector.options[selector.selectedIndex].value);
        run_button.node.firstChild?.firstChild?.firstChild?.firstChild?.replaceWith(run_svg)
      }
    });
    
    nb.toolbar.insertItem(11,"nc",run_button)
    nb.toolbar.insertItem(12,"selector",selector_widget)
  }
 
  private setupWidgetExtension() {
    this.app.docRegistry.addWidgetExtension('Notebook', this);
  }
}


/**
 * Initialization data for the deepcoder-jupyterlab extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'deepcoder-jupyterlab:plugin',
  autoStart: true,
  requires: [INotebookTracker,IMainMenu],
  optional: [ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    tracker: INotebookTracker,
    // menu: IMainMenu
    // panel: NotebookPanel
  ) => {
    new JupyterLabDeepCoder(
      app,
      tracker,
      // menu
      // panel
    );
    console.log('JupyterLab extension jupyterlab_neuralcoder is activated!');
  }
};

export default plugin