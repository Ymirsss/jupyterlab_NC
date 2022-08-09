import { Cell, CodeCell } from '@jupyterlab/cells';
import { INotebookTracker, Notebook} from '@jupyterlab/notebook';
import { IEditorTracker } from '@jupyterlab/fileeditor';
import { showErrorMessage } from '@jupyterlab/apputils';
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
      options: any,
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
  }

  export class JupyterlabNotebookCodeOptimizer extends JupyterlabCodeOptimizer {
    protected notebookTracker: INotebookTracker;
  
    constructor(
      client: JupyterlabDeepCoderClient,
      notebookTracker: INotebookTracker
    ) {
      super(client);
      this.notebookTracker = notebookTracker;
    }
  
    public async optimizeAction(config: any, formatter?: string) {
      return this.optimizeCells(true, config, formatter);
    }
  
  
    public async optimizeAllCodeCells(
      config: any,
      formatter?: string,
      notebook?: Notebook
    ) {
      console.log("optimize feature:",formatter)
      return this.optimizeCells(false, config, formatter, notebook);
    }
    // /*Todo: Automatic Mixed Precison*/
    // public async optimizeAllCodeCells_withAMP(
    //   config: any,
    //   formatter?: string,
    //   notebook?: Notebook
    // ) {
    //   return this.optimizeCells(false, config, formatter, notebook);
    // }


    private getCodeCells(selectedOnly = true, notebook?: Notebook): CodeCell[] {
      if (!this.notebookTracker.currentWidget) {
        return [];
      }
      const codeCells: CodeCell[] = [];
      notebook = notebook || this.notebookTracker.currentWidget.content;
      notebook.widgets.forEach((cell: Cell) => {
        if (cell.model.type === 'code') {
          codeCells.push(cell as CodeCell);
        }
      });
      return codeCells;
    }
  
    private async optimizeCells(
      selectedOnly: boolean,
      config: any,
      formatter?: string,
      notebook?: Notebook
    ) {
      console.log("If it works: ", this.working)
      if (this.working) {
        return;
      }
      try {
        this.working = true;
        const selectedCells = this.getCodeCells(selectedOnly, notebook);
        console.log("selectedCells",selectedCells)
        if (selectedCells.length === 0) {
          console.log("seletedCells: ",selectedCells)
          this.working = false;
          return;
        }
        console.log("I am here")
        const optimize_type = formatter !== undefined ? formatter : 'pytorch_mixed_precision_cpu';
        const currentTexts = selectedCells.map(cell => cell.model.value.text);
        console.log("current texts:",currentTexts)
        const optimizedTexts = await this.optimizeCode(
          currentTexts,
          optimize_type,/*formatterToUse*/
          undefined,/*config[formatterToUse]*/
          true
        );
        console.log("optimizedText:",optimizedTexts)
        console.log("selectedCells.length",selectedCells.length)
        for (let i = 0; i < selectedCells.length; ++i) {
          const cell = selectedCells[i];
          console.log("each cell:",cell);
          const currentText = currentTexts[i];
          console.log("each currentText:",currentText);
          const optimizedText = optimizedTexts.code[i];
          console.log("each optimizedText:",optimizedText);
          console.log("cell mode value text",cell.model.value.text)
          if (cell.model.value.text === currentText) {
            if (optimizedText.error) {
              if (!(config.suppressFormatterErrors ?? false)) {
                await showErrorMessage(
                  'Optimize Code Error',
                  optimizedText.error
                );
              }
            } else {
              console.log("come here");
              cell.model.value.text = optimizedText;
            }
          } else {
            await showErrorMessage(
              'Optimize Code Error',
              `Cell value changed since format request was sent, formatting for cell ${i} skipped.`
            );
          }
        }
      } catch (error) {
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
          void showErrorMessage('Optimize Code Error', error);
        });
    }
  
    applicable(formatter: string, currentWidget: Widget) {
      const currentEditorWidget = this.editorTracker.currentWidget;
      return currentEditorWidget && currentWidget === currentEditorWidget;
    }
  }
  