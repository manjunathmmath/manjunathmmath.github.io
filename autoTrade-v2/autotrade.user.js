// ==UserScript==
// @name         Groot Bot
// @namespace    Groot Bot
// @version      5.9
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
// @resource     BOOTSTRAP_CSS https://manjunathmmath.github.io/autoTrade-v2/dist/css/bootstrap.css
// @resource     DATATABLE_CSS https://manjunathmmath.github.io/autoTrade-v2/global/vendor/datatables/datatables.min.css
// @resource     BOOTSTRAP_ICON_CSS https://manjunathmmath.github.io/autoTrade-v2/dist/font/bootstrap-icons.css
// @resource     FIXED_COLUMN_CSS https://manjunathmmath.github.io/autoTrade-v2/global/vendor/datatables/fixedColumns.dataTables.min.css
// @resource     C3_CSS https://manjunathmmath.github.io/autoTrade-v2/global/vendor/c3/c3.css

// @resource     POPUP_WINDOW_CSS https://manjunathmmath.github.io/autoTrade-v2/common/popupwindow/popupwindow.css
// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/jquery/jquery.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/dist/js/bootstrap.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/common/toastify-js.js

// @require      https://manjunathmmath.github.io/autoTrade-v2/common/sha256.js

// @require      https://manjunathmmath.github.io/autoTrade-v2/common/popupwindow/popupwindow.js

// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/datatables/jquery.dataTables.min.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/datatables/dataTables.fixedColumns.min.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/datatables/fixedColumns.dataTables.js

// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/datatables/dataTables.buttons.min.js


// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/buttons/buttons.html5.min.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/buttons/buttons.print.min.js
// @require      https://manjunathmmath.github.io/autoTrade-v2//global/vendor/buttons/jszip.min.js

// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/fusioncharts/fusioncharts.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/fusioncharts/fusioncharts.charts.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/fusioncharts/fusioncharts.powercharts.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/fusioncharts/themes/fusioncharts.theme.fusion.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/fusioncharts/themes/fusioncharts.theme.candy.js

// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/fusioncharts/fusioncharts.jqueryplugin.min.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/c3/d3.min.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/c3/c3.min.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/tradingview/lightweight-charts.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/global/vendor/apexcharts/apexcharts.min.js


// @require      https://manjunathmmath.github.io/autoTrade-v2/common/monkeyconfig.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/common/axios.min.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/common/qs-lite.min.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/common/moment.min.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/common/popper.min.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/common/tippy-bundle.umd.min.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/common/sweetalert2@11.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/common/toastify-js.js
// @resource     TOASTIFY_CSS https://manjunathmmath.github.io/autoTrade-v2/common/toastify.min.css
// @resource     SACKBAR_CSS https://manjunathmmath.github.io/autoTrade-v2/common/sackbar/js-snackbar.min.css
// @require      https://manjunathmmath.github.io/autoTrade-v2/common/sackbar/js-snackbar.min.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/common/moment.min.js
// @resource     COMMON_CSS https://manjunathmmath.github.io/autoTrade-v2/common.css
// @require      https://manjunathmmath.github.io/autoTrade-v2/common/common.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/common/alertSound.js


// @require      https://manjunathmmath.github.io/autoTrade-v2/constants.js

// @require      https://manjunathmmath.github.io/autoTrade-v2/commoditiesOptionStrikes.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/constants-commodities.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/commodities.js

// @require      https://manjunathmmath.github.io/autoTrade-v2/optionStrike.js

// @require      https://manjunathmmath.github.io/autoTrade-v2/config.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/monkeyStyle.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/utils.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/script.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/oiAnalyzer.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/oiViewer.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/stockViewer.js

// @require      https://manjunathmmath.github.io/autoTrade-v2/marketQuotes.js

// @require      https://manjunathmmath.github.io/autoTrade-v2/help.js
// @require      https://manjunathmmath.github.io/autoTrade-v2/grootTradeBot.js
// @downloadURL  https://manjunathmmath.github.io/autoTrade-v2/autotrade.user.js
// @updateURL    https://manjunathmmath.github.io/autoTrade-v2/autotrade.meta.js
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
