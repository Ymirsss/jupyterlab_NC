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
  
    public async optimizeSelectedCodeCells(
      config: any,
      formatter?: string,
      notebook?: Notebook
    ) {
      return this.optimizeCells(true, config, formatter, notebook);
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
        //  if (!selectedOnly || notebook.isSelectedOrActive(cell)) {
       //     codeCells.push(cell as CodeCell);
         // }
        }
      });
      return codeCells;
    }
  
    private getNotebookType() {
      if (!this.notebookTracker.currentWidget) {
        return null;
      }
  
     // const metadata = this.notebookTracker.currentWidget.content.model.metadata.toJSON();
      const metadata = false;
  
      if (!metadata) {
        return null;
      }
  
      // prefer kernelspec language
      // @ts-ignore
      if (metadata.kernelspec && metadata.kernelspec.language) {
        // @ts-ignore
        return metadata.kernelspec.language.toLowerCase();
      }
  
      // otherwise, check language info code mirror mode
      // @ts-ignore
      if (metadata.language_info && metadata.language_info.codemirror_mode) {
        // @ts-ignore
        return metadata.language_info.codemirror_mode.name.toLowerCase();
      }
  
      return null;
    }
  
    private getDefaultFormatters(config: any): Array<string> {
      const notebookType = this.getNotebookType();
      if (notebookType) {
        const defaultFormatter =
          config.preferences.default_formatter[notebookType];
        if (defaultFormatter instanceof Array) {
          return defaultFormatter;
        } else if (defaultFormatter !== undefined) {
          return [defaultFormatter];
        }
      }
      return [];
    }
  
    private async optimizeCells(
      selectedOnly: boolean,
      config: any,
      formatter?: string,
      notebook?: Notebook
    ) {
      if (this.working) {
        return;
      }
      try {
        this.working = true;
        const selectedCells = this.getCodeCells(selectedOnly, notebook);
        if (selectedCells.length === 0) {
          this.working = false;
          return;
        }
        console.log("I am here")
        const defaultFormatters = this.getDefaultFormatters(config);
        console.log("default Formatters: ", defaultFormatters)
        const formattersToUse =
          formatter !== undefined ? [formatter] : defaultFormatters;
        console.log("formattersToUse: ", formattersToUse)

        if (formattersToUse.length === 0) {
          await showErrorMessage(
            'Jupyterlab Code Formatter Error',
            `Unable to find default formatters to use, please file an issue on GitHub.`
          );
        }
  
        for (let formatterToUse of formattersToUse) {
          if (formatterToUse === 'noop' || formatterToUse === 'skip') {
            continue;
          }
          const currentTexts = selectedCells.map(cell => cell.model.value.text);
          console.log("current texts:",currentTexts)
          const optimizedTexts = await this.optimizeCode(
            currentTexts,
            formatterToUse,
            config[formatterToUse],
            true
          );
          for (let i = 0; i < selectedCells.length; ++i) {
            const cell = selectedCells[i];
            const currentText = currentTexts[i];
            const optimizedText = optimizedTexts.code[i];
            if (cell.model.value.text === currentText) {
              if (optimizedText.error) {
                if (!(config.suppressFormatterErrors ?? false)) {
                  await showErrorMessage(
                    'Jupyterlab Code Formatter Error',
                    optimizedText.error
                  );
                }
              } else {
                cell.model.value.text = optimizedText.code;
              }
            } else {
              await showErrorMessage(
                'Jupyterlab Code Formatter Error',
                `Cell value changed since format request was sent, formatting for cell ${i} skipped.`
              );
            }
          }
        }
      } catch (error) {
        await showErrorMessage('Jupyterlab Code Formatter Error', error);
      }
      this.working = false;
    }
  
    applicable(formatter: string, currentWidget: Widget) {
      const currentNotebookWidget = this.notebookTracker.currentWidget;
      // TODO: Handle showing just the correct formatter for the language later
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
              'Jupyterlab Code Formatter Error',
              data.code[0].error
            );
            this.working = false;
            return;
          }
       //   this.editorTracker.currentWidget.content.editor.model.value.text =
       //     data.code[0].code;
          this.working = false;
        })
        .catch(error => {
          this.working = false;
          void showErrorMessage('Jupyterlab Code Formatter Error', error);
        });
    }
  
    applicable(formatter: string, currentWidget: Widget) {
      const currentEditorWidget = this.editorTracker.currentWidget;
      // TODO: Handle showing just the correct formatter for the language later
      return currentEditorWidget && currentWidget === currentEditorWidget;
    }
  }
  