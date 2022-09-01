import { Cell, CodeCell } from '@jupyterlab/cells';
import { INotebookTracker, Notebook} from '@jupyterlab/notebook';
import { IEditorTracker } from '@jupyterlab/fileeditor';
import { showErrorMessage} from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import JupyterlabDeepCoderClient from './client';



class JupyterlabCodeOptimizer {
    protected client: JupyterlabDeepCoderClient;
    protected working: boolean;
    constructor(client: JupyterlabDeepCoderClient) {
      this.client = client;
      this.working = false;
    }

    protected optimizeCode(
      code: string[],
      formatter: string,
      options: string | undefined,
      notebook: boolean
    ) {
      
      return this.client
        .request(
          'optimize',
          'POST',
          JSON.stringify({
            code,
            notebook,
            formatter,
            options
          })
        )
        .then(resp => JSON.parse(resp));
    }
    protected savefile(
      text: string,
      path: string,
      notebook: boolean
    ) {
      console.log("send save post...")
      return this.client
        .request(
          'save',
          'POST',
          JSON.stringify({
            text,
            notebook,
            path
          })
        )
        .then(resp => JSON.parse(resp));
    }
  }

  export class JupyterlabNotebookCodeOptimizer extends JupyterlabCodeOptimizer {
    protected notebookname: string;
    protected notebookTracker: INotebookTracker;
  
    constructor(
      client: JupyterlabDeepCoderClient,
      notebookTracker: INotebookTracker
    ) {
      super(client);
      this.notebookTracker = notebookTracker;
      this.notebookname = '';
    }
  
    public async optimizeAction(config: any, formatter?: string) {
      return this.optimizeCells(true, config, formatter);
    }
  
  
    public async optimizeAllCodeCells(
      config?: string,
      formatter?: string,
      notebook?: Notebook
    ) {
      return this.optimizeCells(false, config, formatter, notebook);
    }

    private getCodeCells(selectedOnly = true, notebook?: Notebook): CodeCell[] {
      if (!this.notebookTracker.currentWidget) {
        return [];
      }
      const codeCells: CodeCell[] = [];
      notebook = notebook || this.notebookTracker.currentWidget.content;
      console.log("this notebook resolve!!",notebook.rendermime.resolver)
      console.log("this notebook!!",notebook)
      console.log("this notebook title!!",notebook.title.label)
      this.notebookname = notebook.title.label
      notebook.widgets.forEach((cell: Cell) => {
        if (cell.model.type === 'code') {
          codeCells.push(cell as CodeCell);
        }
      });
      return codeCells;
    }
  
    private async optimizeCells(
      selectedOnly: boolean,
      config?: string,
      formatter?: string,
      notebook?: Notebook
    ) {
      if (this.working) {
        return;
      }
      try {
        this.working = true;
        const selectedCells = this.getCodeCells(selectedOnly, notebook);
        console.log("selectedCells", selectedCells)
        console.log("selectedCells length", selectedCells.length)
        console.log("selectedCells cell1", selectedCells[0])
        console.log("selectedCells cell-1", selectedCells[-1])
        let cell = selectedCells[selectedCells.length-1]
        console.log("selectedCells cellcell", cell)
        if (selectedCells.length === 0) {
          this.working = false;
          return;
        }
        const optimize_type = formatter !== undefined ? formatter : 'pytorch_mixed_precision_cpu';
        const currentTexts = selectedCells.map(cell => cell.model.value.text);
        console.log("arrive here 1")
        console.log(optimize_type)
        let optimizedTexts;
        if (optimize_type === "auto-quant"){
            console.log("get cell...")
            console.log(cell)
            cell.outputArea.node.setAttribute("class","pad")
            cell.outputArea.node.innerText = "[NeuralCoder INFO] Auto-Quant Started ......\n"
            cell.outputArea.node.innerText += `[NeuralCoder INFO] Code: User code from Jupyter Lab notebook "${this.notebookname}"\n`
            cell.outputArea.node.innerText += "[NeuralCoder INFO] Benchmark Mode: Throughput\n"
            cell.outputArea.node.innerText += "[NeuralCoder INFO] Enabling and Benchmarking for The Original Model ......\n"
            const optimizedTexts_origin = await this.optimizeCode(
                  currentTexts,
                  '',
                  config,
                  true
                );
            cell.outputArea.node.innerText += `[NeuralCoder INFO] Benchmark Result (Performance) of The Original Model is ${optimizedTexts_origin.log} (FPS)\n`
            cell.outputArea.node.innerText += "[NeuralCoder INFO] Enabling and Benchmarking for The Intel INT8 (Static) ......\n"
            const optimizedTexts_static = await this.optimizeCode(
              currentTexts,
              'pytorch_inc_static_quant_fx',
              config,
              true
            );
            var fps_static = optimizedTexts_static.log
            cell.outputArea.node.innerText += `[NeuralCoder INFO] Benchmark Result (Performance) of Intel INT8 (Static) is ${fps_static} (FPS)\n`
            cell.outputArea.node.innerText += "[NeuralCoder INFO] Enabling and Benchmarking for The Intel INT8 (Dynamic) ......\n"
            const optimizedTexts_dynamic = await this.optimizeCode(
              currentTexts,
              'pytorch_inc_dynamic_quant',
              config,
              true
            );
            var fps_dynamic = optimizedTexts_dynamic.log
            cell.outputArea.node.innerText += `[NeuralCoder INFO] Benchmark Result (Performance) of Intel INT8 (Dynamic) is ${fps_dynamic} (FPS)\n`
            cell.outputArea.node.innerText += "[NeuralCoder INFO] Enabling and Benchmarking for The Intel BF16 ......\n"
            const optimizedTexts_bf16 = await this.optimizeCode(
              currentTexts,
              'pytorch_inc_bf16',
              config,
              true
            );
            var fps_bf16 = optimizedTexts_bf16.log
            cell.outputArea.node.innerText += `[NeuralCoder INFO] Benchmark Result (performance) of Intel BF16 is ${fps_bf16} (FPS)\n`
            
            let best_feature:string[];
            optimizedTexts = fps_static > fps_dynamic ? optimizedTexts_static : optimizedTexts_dynamic
            best_feature = fps_static > fps_dynamic ? ["pytorch_inc_static_quant_fx","Intel INT8 (static)"]:["pytorch_inc_dynamic_quant","Intel INT8 (dynamic)"]
            console.log("static vs dynamic...", optimizedTexts)
            optimizedTexts = fps_bf16 > optimizedTexts.log ? optimizedTexts_bf16: optimizedTexts
            best_feature = fps_bf16 > optimizedTexts.log ? ["pytorch_inc_bf16","Intel BF16"]:best_feature
            console.log("best feature dic:", best_feature)
            const optimizedTexts_best = await this.optimizeCode(
              currentTexts,
              best_feature[0],
              'normal',
              true
            );
            console.log("fp16 vs dynamic...", optimizedTexts)
            console.log("origin dps", optimizedTexts_origin.log)
            cell.outputArea.node.innerText += `[NeuralCoder INFO] The Best Intel Optimization: ${best_feature[1]}\n`
            cell.outputArea.node.innerText += `[NeuralCoder INFO] You can get up to ${( optimizedTexts.log / optimizedTexts_origin.log).toFixed(1)}X performance boost.\n`
             cell.outputArea.node.innerText += `[NeuralCoder INFO] HardWare: ${optimizedTexts.hardware}\n`
             const response = await this.savefile(
                cell.outputArea.node.innerText,
                `${optimizedTexts.path}/../../NeuralCoder.log`,
                true
              );
             
             if (response["save"] === 'success'){
               cell.outputArea.node.innerText += `[NeuralCoder INFO] The log was saved to NeuralCoder.log\n`
             } 
           
           
            
           
            optimizedTexts = optimizedTexts_best
        }
        else{
          optimizedTexts = await this.optimizeCode(
          currentTexts,
          optimize_type,
          "normal",
          true
          );
        }
        console.log("arrive here 2")
        for (let i = 0; i < selectedCells.length; ++i) {
          const cell = selectedCells[i];
          const currentText = currentTexts[i];
          const optimizedText = optimizedTexts.code[i];
          if (cell.model.value.text === currentText) {
            if (optimizedText.error) {
              await showErrorMessage(
                  'Optimize Code Error',
                  optimizedText.error
                );
             
            } else {
              cell.model.value.text = optimizedText;
            }
          } else {
            console.log("here 2")

            await showErrorMessage(
              'Optimize Code Error',
              `Cell value changed since format request was sent, formatting for cell ${i} skipped.`
            );
          }
        }
      } catch (error) {
        console.log("here 3")

        await showErrorMessage('Optimize Code Error', error);
      }
      this.working = false;
    }
    applicable(formatter: string, currentWidget: Widget) {
      const currentNotebookWidget = this.notebookTracker.currentWidget;
      return currentNotebookWidget && currentWidget === currentNotebookWidget;
    }
  }
  export class JupyterlabFileEditorCodeOptimizer extends JupyterlabCodeOptimizer {
    protected editorTracker: IEditorTracker;
  
    constructor(
      client: JupyterlabDeepCoderClient,
      editorTracker: IEditorTracker
    ) {
      super(client);
      this.editorTracker = editorTracker;
    }
  
    optimizeAction(config: any, formatter: string) {
      if (this.working) {
        return;
      }
      const editorWidget = this.editorTracker.currentWidget;
      this.working = true;
      if(editorWidget == null){
        return;
      }
      const editor = editorWidget.content.editor;
      const code = editor.model.value.text;
      this.optimizeCode([code], formatter, config[formatter], false)
        .then(data => {
          if (data.code[0].error) {
            console.log("here 4")

            void showErrorMessage(
              'Optimize Code Error',
              data.code[0].error
            );
            this.working = false;
            return;
          }
          this.working = false;
        })
        .catch(error => {
          this.working = false;
          console.log("here 5")

          void showErrorMessage('Optimize Code Error', error);
        });
    }
  
    applicable(formatter: string, currentWidget: Widget) {
      const currentEditorWidget = this.editorTracker.currentWidget;
      return currentEditorWidget && currentWidget === currentEditorWidget;
    }
  }
  