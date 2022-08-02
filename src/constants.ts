export namespace Constants {
    export const SHORT_PLUGIN_NAME = 'jupyterlab_deepCoder';
    export const OPTIMIZE_COMMAND = `${SHORT_PLUGIN_NAME}:optimize`;

    /*workaround 1: single-framework*/
    export const OPTIMIZE_AMP_COMMAND = `${SHORT_PLUGIN_NAME}:optimize_amp`;
    export const OPTIMIZE_INC_DQ_COMMAND = `${SHORT_PLUGIN_NAME}:optimize_inc_dq`;
    export const OPTIMIZE_JIT_COMMAND = `${SHORT_PLUGIN_NAME}:optimize_jit`;
    export const OPTIMIZE_CL_COMMAND = `${SHORT_PLUGIN_NAME}:optimize_cl`;
    export const OPTIMIZE_CToC_COMMAND = `${SHORT_PLUGIN_NAME}:optimize_ctoc`;
    export const OPTIMIZE_PROFILER_COMMAND = `${SHORT_PLUGIN_NAME}:optimize_profiler`;

    /*workaround 2: multi-framework*/
    // export const OPTIMIZE_PT_COMMAND = `${SHORT_PLUGIN_NAME}:optimize_pytorch`;
    // export const OPTIMIZE_TF_COMMAND = `${SHORT_PLUGIN_NAME}:optimize_tensorflow`;
    // export const OPTIMIZE_KERAS_COMMAND = `${SHORT_PLUGIN_NAME}:optimize_keras`;





    export const OPTIMIZE_ALL_COMMAND = `${SHORT_PLUGIN_NAME}:optimize_all`;
    // TODO: Extract this to style and import svg as string
    export const ICON_FORMAT_ALL_SVG =
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1792 1792"><path class="jp-icon3" d="M1473 929q7-118-33-226.5t-113-189t-177-131T929 325q-116-7-225.5 32t-192 110.5t-135 175T317 863q-7 118 33 226.5t113 189t177.5 131T862 1467q155 9 293-59t224-195.5t94-283.5zM1792 0l-349 348q120 117 180.5 272t50.5 321q-11 183-102 339t-241 255.5T999 1660L0 1792l347-347q-120-116-180.5-271.5T116 852q11-184 102-340t241.5-255.5T792 132q167-22 500-66t500-66z" fill="#626262"/></svg>';
    export const ICON_FORMAT_ALL = 'fa fa-superpowers';
    export const LONG_PLUGIN_NAME = `@ryantam626/${SHORT_PLUGIN_NAME}`;
    export const SETTINGS_SECTION = `${LONG_PLUGIN_NAME}:settings`;
    export const COMMAND_SECTION_NAME = 'Jupyterlab Code Optimizer';
    // TODO: Use package.json info
    export const PLUGIN_VERSION = '1.5.1';
  }
  