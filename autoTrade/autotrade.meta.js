// ==UserScript==
// @name         Groot Bot
// @namespace    Groot Bot
// @version      2.0
// @description  Groot Bot
// @author       Manjunath
// @match        https://kite.zerodha.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_getClipboard
// @resource     BOOTSTRAP_CSS https://manjunathmmath.github.io/autoTrade/dist/css/bootstrap.css
// @resource     DATATABLE_CSS https://manjunathmmath.github.io/autoTrade/global/vendor/datatables/datatables.min.css
// @resource     BOOTSTRAP_ICON_CSS https://manjunathmmath.github.io/autoTrade/dist/font/bootstrap-icons.css
// @resource     POPUP_WINDOW_CSS https://manjunathmmath.github.io/autoTrade/common/popupwindow/popupwindow.css
// @resource     FIXED_COLUMN_CSS https://manjunathmmath.github.io/autoTrade/global/vendor/datatables/fixedColumns.dataTables.min.css
// @resource     C3_CSS https://manjunathmmath.github.io/autoTrade/global/vendor/c3/c3.css

// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/jquery/jquery.js
// @require      https://manjunathmmath.github.io/autoTrade/dist/js/bootstrap.js
// @require      https://manjunathmmath.github.io/autoTrade/common/toastify-js.js

// @require      https://manjunathmmath.github.io/autoTrade/common/sha256.js

// @require      https://manjunathmmath.github.io/autoTrade/common/popupwindow/popupwindow.js
// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/datatables/jquery.dataTables.min.js
// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/datatables/dataTables.fixedColumns.min.js
// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/datatables/fixedColumns.dataTables.js
// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/datatables/dataTables.buttons.min.js

// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/buttons/buttons.html5.min.js
// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/buttons/buttons.print.min.js
// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/buttons/jszip.min.js

// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/fusioncharts/fusioncharts.js
// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/fusioncharts/fusioncharts.charts.js
// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/fusioncharts/fusioncharts.powercharts.js
// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/fusioncharts/themes/fusioncharts.theme.fusion.js
// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/fusioncharts/themes/fusioncharts.theme.candy.js
// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/fusioncharts/fusioncharts.jqueryplugin.min.js

// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/c3/d3.min.js
// @require      https://manjunathmmath.github.io/autoTrade/global/vendor/c3/c3.min.js



// @require      https://manjunathmmath.github.io/autoTrade/common/monkeyconfig.js
// @require      https://manjunathmmath.github.io/autoTrade/common/axios.min.js
// @require      https://manjunathmmath.github.io/autoTrade/common/qs-lite.min.js
// @require      https://manjunathmmath.github.io/autoTrade/common/moment.min.js
// @require      https://manjunathmmath.github.io/autoTrade/common/popper.min.js
// @require      https://manjunathmmath.github.io/autoTrade/common/tippy-bundle.umd.min.js
// @require      https://manjunathmmath.github.io/autoTrade/common/sweetalert2@11.js
// @require      https://manjunathmmath.github.io/autoTrade/common/toastify-js.js
// @resource     TOASTIFY_CSS https://manjunathmmath.github.io/autoTrade/common/toastify.min.css
// @resource     SACKBAR_CSS https://manjunathmmath.github.io/autoTrade/common/sackbar/js-snackbar.min.css
// @require      https://manjunathmmath.github.io/autoTrade/common/sackbar/js-snackbar.min.js
// @resource     COMMON_CSS https://manjunathmmath.github.io/autoTrade/common.css
// @require      https://manjunathmmath.github.io/autoTrade/common/common.js
// @require      https://manjunathmmath.github.io/autoTrade/common/alertSound.js
// @require      https://manjunathmmath.github.io/autoTrade/constants.js

// @require      https://manjunathmmath.github.io/autoTrade/commoditiesOptionStrikes.js
// @require      https://manjunathmmath.github.io/autoTrade/constants-commodities.js
// @require      https://manjunathmmath.github.io/autoTrade/commodities.js


// @require      https://manjunathmmath.github.io/autoTrade/optionStrike.js

// @require      https://manjunathmmath.github.io/autoTrade/config.js
// @require      https://manjunathmmath.github.io/autoTrade/monkeyStyle.js
// @require      https://manjunathmmath.github.io/autoTrade/utils.js
// @require      https://manjunathmmath.github.io/autoTrade/script.js
// @require      https://manjunathmmath.github.io/autoTrade/grootTradeBot.js
// @require      https://manjunathmmath.github.io/autoTrade/oiAnalyzer.js
// @require      https://manjunathmmath.github.io/autoTrade/oiViewer.js
// @require      https://manjunathmmath.github.io/autoTrade/stockViewer.js
// @require      https://manjunathmmath.github.io/autoTrade/marketQuotes.js
// @downloadURL  https://manjunathmmath.github.io/autoTrade/autotrade.user.js
// @updateURL    https://manjunathmmath.github.io/autoTrade/autotrade.meta.js
// ==/UserScript==

// This is free and unencumbered software released into the public domain.

// Anyone is free to copy, modify, publish, use, compile, sell, or
// distribute this software, either in source code form or as a compiled
// binary, for any purpose, commercial or non-commercial, and by any
// means.

// In jurisdictions that recognize copyright laws, the author or authors
// of this software dedicate any and all copyright interest in the
// software to the public domain. We make this dedication for the benefit
// of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of
// relinquishment in perpetuity of all present and future rights to this
// software under copyright law.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
// OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

// For more information, please refer to <https://unlicense.org>
