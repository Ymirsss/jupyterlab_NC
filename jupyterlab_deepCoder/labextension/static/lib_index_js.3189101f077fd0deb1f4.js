"use strict";
(self["webpackChunkjupyterlab_deepCoder"] = self["webpackChunkjupyterlab_deepCoder"] || []).push([["lib_index_js"],{

/***/ "./lib/client.js":
/*!***********************!*\
  !*** ./lib/client.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/coreutils */ "webpack/sharing/consume/default/@jupyterlab/coreutils");
/* harmony import */ var _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/services */ "webpack/sharing/consume/default/@jupyterlab/services");
/* harmony import */ var _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants */ "./lib/constants.js");



class JupyterlabDeepCoderClient {
    request(path, method, body) {
        const settings = _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__.ServerConnection.makeSettings();
        const fullUrl = _jupyterlab_coreutils__WEBPACK_IMPORTED_MODULE_0__.URLExt.join(settings.baseUrl, _constants__WEBPACK_IMPORTED_MODULE_2__.Constants.SHORT_PLUGIN_NAME, path);
        return _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__.ServerConnection.makeRequest(fullUrl, {
            body,
            method,
            headers: new Headers({
                'Plugin-Version': _constants__WEBPACK_IMPORTED_MODULE_2__.Constants.PLUGIN_VERSION
            })
        }, settings).then(response => {
            if (response.status !== 200) {
                return response.text().then(() => {
                    throw new _jupyterlab_services__WEBPACK_IMPORTED_MODULE_1__.ServerConnection.ResponseError(response, response.statusText);
                });
            }
            return response.text();
        });
    }
    getAvailableFormatters() {
        return this.request('formatters', 'GET', null);
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (JupyterlabDeepCoderClient);


/***/ }),

/***/ "./lib/constants.js":
/*!**************************!*\
  !*** ./lib/constants.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Constants": () => (/* binding */ Constants)
/* harmony export */ });
var Constants;
(function (Constants) {
    Constants.SHORT_PLUGIN_NAME = 'jupyterlab_deepCoder';
    Constants.OPTIMIZE_COMMAND = `${Constants.SHORT_PLUGIN_NAME}:optimize`;
    /*workaround 1: single-framework*/
    Constants.OPTIMIZE_AMP_COMMAND = `${Constants.SHORT_PLUGIN_NAME}:optimize_amp`;
    Constants.OPTIMIZE_INC_DQ_COMMAND = `${Constants.SHORT_PLUGIN_NAME}:optimize_inc_dq`;
    Constants.OPTIMIZE_JIT_COMMAND = `${Constants.SHORT_PLUGIN_NAME}:optimize_jit`;
    Constants.OPTIMIZE_CL_COMMAND = `${Constants.SHORT_PLUGIN_NAME}:optimize_cl`;
    Constants.OPTIMIZE_CToC_COMMAND = `${Constants.SHORT_PLUGIN_NAME}:optimize_ctoc`;
    Constants.OPTIMIZE_PROFILER_COMMAND = `${Constants.SHORT_PLUGIN_NAME}:optimize_profiler`;
    /*workaround 2: multi-framework*/
    // export const OPTIMIZE_PT_COMMAND = `${SHORT_PLUGIN_NAME}:optimize_pytorch`;
    // export const OPTIMIZE_TF_COMMAND = `${SHORT_PLUGIN_NAME}:optimize_tensorflow`;
    // export const OPTIMIZE_KERAS_COMMAND = `${SHORT_PLUGIN_NAME}:optimize_keras`;
    Constants.OPTIMIZE_ALL_COMMAND = `${Constants.SHORT_PLUGIN_NAME}:optimize_all`;
    // TODO: Extract this to style and import svg as string
    Constants.ICON_FORMAT_ALL_SVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1792 1792"><path class="jp-icon3" d="M1473 929q7-118-33-226.5t-113-189t-177-131T929 325q-116-7-225.5 32t-192 110.5t-135 175T317 863q-7 118 33 226.5t113 189t177.5 131T862 1467q155 9 293-59t224-195.5t94-283.5zM1792 0l-349 348q120 117 180.5 272t50.5 321q-11 183-102 339t-241 255.5T999 1660L0 1792l347-347q-120-116-180.5-271.5T116 852q11-184 102-340t241.5-255.5T792 132q167-22 500-66t500-66z" fill="#626262"/></svg>';
    Constants.ICON_FORMAT_ALL = 'fa fa-superpowers';
    Constants.LONG_PLUGIN_NAME = `@ryantam626/${Constants.SHORT_PLUGIN_NAME}`;
    Constants.SETTINGS_SECTION = `${Constants.LONG_PLUGIN_NAME}:settings`;
    Constants.COMMAND_SECTION_NAME = 'Jupyterlab Code Optimizer';
    // TODO: Use package.json info
    Constants.PLUGIN_VERSION = '1.5.1';
})(Constants || (Constants = {}));


/***/ }),

/***/ "./lib/deepcoder.js":
/*!**************************!*\
  !*** ./lib/deepcoder.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "JupyterlabFileEditorCodeOptimizer": () => (/* binding */ JupyterlabFileEditorCodeOptimizer),
/* harmony export */   "JupyterlabNotebookCodeOptimizer": () => (/* binding */ JupyterlabNotebookCodeOptimizer)
/* harmony export */ });
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__);

class JupyterlabCodeOptimizer {
    constructor(client) {
        this.client = client;
        this.working = false;
    }
    optimizeCode(code, formatter, options, notebook) {
        return this.client
            .request('optimize', 'POST', JSON.stringify({
            code,
            notebook,
            formatter,
            options
        }))
            .then(resp => JSON.parse(resp));
    }
}
class JupyterlabNotebookCodeOptimizer extends JupyterlabCodeOptimizer {
    constructor(client, notebookTracker) {
        super(client);
        this.notebookTracker = notebookTracker;
    }
    async optimizeAction(config, formatter) {
        return this.optimizeCells(true, config, formatter);
    }
    // public async optimizeSelectedCodeCells(
    //   config: any,
    //   formatter?: string,
    //   notebook?: Notebook
    // ) {
    //   return this.optimizeCells(true, config, formatter, notebook);
    // }
    async optimizeAllCodeCells(config, formatter, notebook) {
        console.log("optimize feature:", formatter);
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
    getCodeCells(selectedOnly = true, notebook) {
        if (!this.notebookTracker.currentWidget) {
            return [];
        }
        const codeCells = [];
        notebook = notebook || this.notebookTracker.currentWidget.content;
        notebook.widgets.forEach((cell) => {
            if (cell.model.type === 'code') {
                codeCells.push(cell);
                //  if (!selectedOnly || notebook.isSelectedOrActive(cell)) {
                //    codeCells.push(cell as CodeCell);
                //  }
            }
        });
        return codeCells;
    }
    // private getNotebookType() {
    //   if (!this.notebookTracker.currentWidget) {
    //     return null;
    //   }
    //  // const metadata = this.notebookTracker.currentWidget.content.model.metadata.toJSON();
    //   const metadata = false;
    //   if (!metadata) {
    //     return null;
    //   }
    //   // prefer kernelspec language
    //   // @ts-ignore
    //   if (metadata.kernelspec && metadata.kernelspec.language) {
    //     // @ts-ignore
    //     return metadata.kernelspec.language.toLowerCase();
    //   }
    //   // otherwise, check language info code mirror mode
    //   // @ts-ignore
    //   if (metadata.language_info && metadata.language_info.codemirror_mode) {
    //     // @ts-ignore
    //     return metadata.language_info.codemirror_mode.name.toLowerCase();
    //   }
    //   return null;
    // }
    // private getDefaultFormatters(config: any): Array<string> {
    //   const notebookType = this.getNotebookType();
    //   if (notebookType) {
    //     const defaultFormatter =
    //       config.preferences.default_formatter[notebookType];
    //     if (defaultFormatter instanceof Array) {
    //       return defaultFormatter;
    //     } else if (defaultFormatter !== undefined) {
    //       return [defaultFormatter];
    //     }
    //   }
    //   return [];
    // }
    async optimizeCells(selectedOnly, config, formatter, notebook) {
        var _a;
        console.log("If it works: ", this.working);
        if (this.working) {
            return;
        }
        try {
            this.working = true;
            const selectedCells = this.getCodeCells(selectedOnly, notebook);
            if (selectedCells.length === 0) {
                console.log("seletedCells: ", selectedCells);
                this.working = false;
                return;
            }
            console.log("I am here");
            // const defaultFormatters = this.getDefaultFormatters(config);
            // console.log("default Formatters: ", defaultFormatters)
            // const formattersToUse =
            //   formatter !== undefined ? [formatter] : defaultFormatters;
            // console.log("formattersToUse: ", formattersToUse)
            // if (formattersToUse.length === 0) {
            //   await showErrorMessage(
            //     'Jupyterlab Code Formatter Error',
            //     `Unable to find default formatters to use, please file an issue on GitHub.`
            //   );
            // }
            // for (let formatterToUse of formattersToUse) {
            //   if (formatterToUse === 'noop' || formatterToUse === 'skip') {
            //     continue;
            //   }
            const optimize_type = formatter !== undefined ? formatter : 'pytorch_mixed_precision_cpu';
            const currentTexts = selectedCells.map(cell => cell.model.value.text);
            console.log("current texts:", currentTexts);
            const optimizedTexts = await this.optimizeCode(currentTexts, optimize_type, /*formatterToUse*/ undefined, /*config[formatterToUse]*/ true);
            for (let i = 0; i < selectedCells.length; ++i) {
                const cell = selectedCells[i];
                const currentText = currentTexts[i];
                const optimizedText = optimizedTexts.code[i];
                if (cell.model.value.text === currentText) {
                    if (optimizedText.error) {
                        if (!((_a = config.suppressFormatterErrors) !== null && _a !== void 0 ? _a : false)) {
                            await (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.showErrorMessage)('Optimize Code Error', optimizedText.error);
                        }
                    }
                    else {
                        cell.model.value.text = optimizedText.code;
                    }
                }
                else {
                    await (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.showErrorMessage)('Optimize Code Error', `Cell value changed since format request was sent, formatting for cell ${i} skipped.`);
                }
            }
        }
        catch (error) {
            await (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.showErrorMessage)('Optimize Code Error', error);
        }
        this.working = false;
    }
    applicable(formatter, currentWidget) {
        const currentNotebookWidget = this.notebookTracker.currentWidget;
        // TODO: Handle showing just the correct formatter for the language later
        return currentNotebookWidget && currentWidget === currentNotebookWidget;
    }
}
class JupyterlabFileEditorCodeOptimizer extends JupyterlabCodeOptimizer {
    constructor(client, editorTracker) {
        super(client);
        this.editorTracker = editorTracker;
    }
    optimizeAction(config, formatter) {
        if (this.working) {
            return;
        }
        const editorWidget = this.editorTracker.currentWidget;
        this.working = true;
        if (editorWidget == null) {
            return;
        }
        const editor = editorWidget.content.editor;
        const code = editor.model.value.text;
        this.optimizeCode([code], formatter, config[formatter], false)
            .then(data => {
            if (data.code[0].error) {
                void (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.showErrorMessage)('Optimize Code Error', data.code[0].error);
                this.working = false;
                return;
            }
            //   this.editorTracker.currentWidget.content.editor.model.value.text =
            //     data.code[0].code;
            this.working = false;
        })
            .catch(error => {
            this.working = false;
            void (0,_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_0__.showErrorMessage)('Optimize Code Error', error);
        });
    }
    applicable(formatter, currentWidget) {
        const currentEditorWidget = this.editorTracker.currentWidget;
        // TODO: Handle showing just the correct formatter for the language later
        return currentEditorWidget && currentWidget === currentEditorWidget;
    }
}


/***/ }),

/***/ "./lib/index.js":
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @jupyterlab/notebook */ "webpack/sharing/consume/default/@jupyterlab/notebook");
/* harmony import */ var _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @jupyterlab/apputils */ "webpack/sharing/consume/default/@jupyterlab/apputils");
/* harmony import */ var _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _jupyterlab_settingregistry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @jupyterlab/settingregistry */ "webpack/sharing/consume/default/@jupyterlab/settingregistry");
/* harmony import */ var _jupyterlab_settingregistry__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_settingregistry__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _jupyterlab_mainmenu__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @jupyterlab/mainmenu */ "webpack/sharing/consume/default/@jupyterlab/mainmenu");
/* harmony import */ var _jupyterlab_mainmenu__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_mainmenu__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _lumino_disposable__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @lumino/disposable */ "webpack/sharing/consume/default/@lumino/disposable");
/* harmony import */ var _lumino_disposable__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_lumino_disposable__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @jupyterlab/ui-components */ "webpack/sharing/consume/default/@jupyterlab/ui-components");
/* harmony import */ var _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @lumino/widgets */ "webpack/sharing/consume/default/@lumino/widgets");
/* harmony import */ var _lumino_widgets__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_lumino_widgets__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _deepcoder__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./deepcoder */ "./lib/deepcoder.js");
/* harmony import */ var _client__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./client */ "./lib/client.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./constants */ "./lib/constants.js");




// import { IEditorTracker } from '@jupyterlab/fileeditor';






class JupyterLabDeepCoder {
    // private fileEditorCodeOptimizer: JupyterlabFileEditorCodeOptimizer;
    constructor(app, tracker, 
    // palette: ICommandPalette,
    // settingRegistry: ISettingRegistry,
    menu) {
        this.app = app;
        this.tracker = tracker;
        // this.editorTracker = editorTracker;
        // this.palette = palette;
        // this.settingRegistry = settingRegistry;
        this.menu = menu;
        this.client = new _client__WEBPACK_IMPORTED_MODULE_7__["default"]();
        this.notebookCodeOptimizer = new _deepcoder__WEBPACK_IMPORTED_MODULE_8__.JupyterlabNotebookCodeOptimizer(this.client, this.tracker);
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
    }
    createNew(nb, context) {
        // const self = this;
        const button = new _jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__.ToolbarButton({
            tooltip: 'Optimize',
            icon: new _jupyterlab_ui_components__WEBPACK_IMPORTED_MODULE_5__.LabIcon({
                name: _constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_ALL_COMMAND,
                svgstr: _constants__WEBPACK_IMPORTED_MODULE_9__.Constants.ICON_FORMAT_ALL_SVG
            }),
            onClick: async () => {
                // await self.notebookCodeOptimizer.optimizeAllCodeCells(
                //   this.config,
                //   undefined,
                //   nb.content
                // );
                console.log("It's an empty button.");
            }
        });
        nb.toolbar.addItem("Optimize Code", button);
        // nb.toolbar.insertAfter(
        //   'cellType',
        //   this.app.commands.label(Constants.OPTIMIZE_ALL_COMMAND),
        //   button
        // );
        nb.toolbar.insertItem(10, 'clearOutputs', button);
        // context.saveState.connect(this.onSave, this);
        return new _lumino_disposable__WEBPACK_IMPORTED_MODULE_4__.DisposableDelegate(() => {
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
    setupWidgetExtension() {
        this.app.docRegistry.addWidgetExtension('Notebook', this);
    }
    setupContextMenu() {
        this.app.contextMenu.addItem({
            command: _constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_COMMAND,
            selector: '.jp-Notebook'
        });
        const commands = this.app.commands;
        const deepcoderMenu = new _lumino_widgets__WEBPACK_IMPORTED_MODULE_6__.Menu({ commands });
        deepcoderMenu.title.label = 'NeuralCoder';
        /*workaround 1: single-framework*/
        deepcoderMenu.title.label;
        deepcoderMenu.addItem({ command: _constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_AMP_COMMAND });
        deepcoderMenu.addItem({ type: 'separator' });
        deepcoderMenu.addItem({ command: _constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_INC_DQ_COMMAND });
        deepcoderMenu.addItem({ type: 'separator' });
        deepcoderMenu.addItem({ command: _constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_JIT_COMMAND });
        deepcoderMenu.addItem({ type: 'separator' });
        deepcoderMenu.addItem({ command: _constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_CL_COMMAND });
        deepcoderMenu.addItem({ type: 'separator' });
        deepcoderMenu.addItem({ command: _constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_CToC_COMMAND });
        deepcoderMenu.addItem({ type: 'separator' });
        deepcoderMenu.addItem({ command: _constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_PROFILER_COMMAND });
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
        this.menu.addMenu(deepcoderMenu);
    }
    setupAllCommands() {
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
        this.app.commands.addCommand(_constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_ALL_COMMAND, {
            execute: async () => {
                await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
            },
            iconClass: _constants__WEBPACK_IMPORTED_MODULE_9__.Constants.ICON_FORMAT_ALL,
            iconLabel: 'Optimize code'
            // TODO: Add back isVisible
        });
        this.app.commands.addCommand(_constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_AMP_COMMAND, {
            execute: async () => {
                await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
            },
            label: 'Automatic Mixed Precison'
            // TODO: Add back isVisible
        });
        this.app.commands.addCommand(_constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_INC_DQ_COMMAND, {
            execute: async () => {
                await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
            },
            label: 'INC Dynamic Quantization (INT8) '
            // TODO: Add back isVisible
        });
        this.app.commands.addCommand(_constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_JIT_COMMAND, {
            execute: async () => {
                await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
            },
            label: 'JIT'
            // TODO: Add back isVisible
        });
        this.app.commands.addCommand(_constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_CL_COMMAND, {
            execute: async () => {
                await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config);
            },
            label: 'Channels Last (memory fomat)'
            // TODO: Add back isVisible
        });
        this.app.commands.addCommand(_constants__WEBPACK_IMPORTED_MODULE_9__.Constants.OPTIMIZE_CToC_COMMAND, {
            execute: async () => {
                await this.notebookCodeOptimizer.optimizeAllCodeCells(this.config, "pytorch_cuda_to_cpu");
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
}
/**
 * Initialization data for the deepcoder-jupyterlab extension.
 */
const plugin = {
    id: 'deepcoder-jupyterlab:plugin',
    autoStart: true,
    // requires: [ICommandPalette,INotebookTracker,ISettingRegistry,IMainMenu,IEditorTracker],
    requires: [_jupyterlab_apputils__WEBPACK_IMPORTED_MODULE_1__.ICommandPalette, _jupyterlab_notebook__WEBPACK_IMPORTED_MODULE_0__.INotebookTracker, _jupyterlab_mainmenu__WEBPACK_IMPORTED_MODULE_3__.IMainMenu],
    optional: [_jupyterlab_settingregistry__WEBPACK_IMPORTED_MODULE_2__.ISettingRegistry],
    activate: (app, palette, tracker, 
    // settingRegistry: ISettingRegistry,
    menu) => {
        new JupyterLabDeepCoder(app, tracker, 
        // palette
        // settingRegistry,
        menu);
        console.log('JupyterLab extension jupyterlab_apod is activated!');
        console.log('ICommandPalette:', palette);
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (plugin);


/***/ })

}]);
//# sourceMappingURL=lib_index_js.3189101f077fd0deb1f4.js.map