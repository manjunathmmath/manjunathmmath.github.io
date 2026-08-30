// ── Quote fetch popup + WebSocket subscribe popup ──────────────────────────────
// Two standalone tools:
//   showQuotePopup()     — search an instrument, fetch its live quote via the official
//                          Kite Connect REST Quote API (api.kite.trade), using
//                          GM_xmlhttpRequest instead of jQ.ajax so the browser's CORS
//                          policy doesn't block the cross-origin response (Kite Connect's
//                          API sends no permissive CORS headers for arbitrary browser
//                          origins — this is why the old getQuotesUsingPromise() in
//                          utils.js, which used jQ.ajax, silently failed).
//   showWebSocketPopup() — subscribe to one or more instruments on Kite's live ticker
//                          WebSocket (wss://ws.kite.trade) directly from the page. Unlike
//                          XHR/fetch, WebSocket connections aren't subject to CORS
//                          preflight — only to the server optionally rejecting based on
//                          Origin, which groot-ui's own working WS client (connecting from
//                          an ordinary browser tab, not a privileged extension context)
//                          already proves Kite's ticker doesn't do.
//
// Both need api_key + api_access_token (Settings → API Key/Access Token, config.js) —
// the same OAuth access_token used for getQuotesUsingPromise(), NOT the enctoken used
// elsewhere in this app for kite.zerodha.com's own internal endpoints.

// ── Quote fetch (GM_xmlhttpRequest — bypasses CORS) ────────────────────────────

function _qwExchangeFor(name) {
    if (name === 'SENSEX' || name === 'BANKEX') return 'BSE';
    if (['CRUDEOILM', 'CRUDEOIL', 'GOLD', 'GOLDM', 'SILVER', 'SILVERM', 'NATURALGAS',
         'COPPER', 'ZINC', 'ALUMINIUM', 'NICKEL', 'LEAD'].indexOf(name) !== -1) return 'MCX';
    if (name === 'USDINR' || name === 'EURINR' || name === 'GBPINR' || name === 'JPYINR') return 'CDS';
    return 'NSE';
}

// Fetches one instrument's live quote via GM_xmlhttpRequest (bypasses page CORS).
function _qwFetchQuote(instrumentKey) {
    var apiKey = g_config.get('api_key');
    var accessToken = g_config.get('api_access_token');
    console.log(g_config.get('api_key'), g_config.get('api_access_token'))
    return new Promise(function (resolve, reject) {
        if (!accessToken) { reject('No Access Token set — open Settings and set api_access_token'); return; }
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://api.kite.trade/quote?i=' + encodeURIComponent(instrumentKey),
            headers: { 'Authorization': 'token ' + apiKey + ':' + accessToken },
            onload: function (res) {
                try {
                    var j = JSON.parse(res.responseText);
                    if (j.status !== 'success') { reject((j.message) || 'Quote API error'); return; }
                    resolve(j.data[instrumentKey]);
                } catch (e) { reject('Failed to parse response: ' + e.message); }
            },
            onerror: function () { reject('Request failed (network error or CORS still blocked)'); },
            ontimeout: function () { reject('Request timed out'); },
        });
    });
}

function showQuotePopup() {
    var html = ''
        + '<div style="padding:10px;font-size:0.75rem;">'
        + '  <div style="display:flex;gap:6px;margin-bottom:8px;position:relative;">'
        + '    <input id="qw-search" type="text" placeholder="Search instrument…" '
        + '           style="flex:1;padding:4px 8px;background:var(--gtb-surface,#161b22);color:var(--gtb-text,#e6edf3);border:1px solid var(--gtb-border,#30363d);" />'
        + '    <button id="qw-fetch-btn" class="gtb-btn" style="padding:4px 12px;">Fetch</button>'
        + '    <div id="qw-suggest" style="position:absolute;top:100%;left:0;right:70px;background:var(--gtb-surface,#161b22);border:1px solid var(--gtb-border,#30363d);z-index:20;display:none;max-height:180px;overflow:auto;"></div>'
        + '  </div>'
        + '  <div id="qw-result" style="color:var(--gtb-muted,#7d8590);">Search and select an instrument, then Fetch.</div>'
        + '</div>';

    showPopUpWindow('quote-fetch', html, 'Quote Fetch', 420, 380);
    var _cls = 'popup-custom-style-quote-fetch';
    var _title = '<div style="display:flex;align-items:center;gap:6px;width:100%;">'
        + '<span style="font-weight:800;font-size:0.7rem;"><i class="bi bi-search"></i> QUOTE FETCH</span>'
        + popupWinControls(_cls)
        + '</div>';
    jQ('.' + _cls).find('.popupwindow_titlebar_text').html(_title);
    hideNativePopupButtons(_cls);
    // Deliberately draggable (unlike most other popups in this app, which remove
    // popupwindow_titlebar_draggable to stop the popup moving on titlebar-padding clicks) —
    // requested explicitly for this popup, so the draggable class is left in place.
    jQ('.' + _cls).toggleClass('gtb-light', (localStorage.getItem('GTB_THEME') || 'dark') === 'light');

    var selected = null; // { name, key }

    jQ('#qw-search').on('input', function () {
        var q = jQ(this).val().toUpperCase().trim();
        selected = null;
        if (q.length < 1) { jQ('#qw-suggest').hide().empty(); return; }
        var names = Object.keys(INSTRUMENT_TOKENS).filter(function (n) { return n.indexOf(q) !== -1; }).slice(0, 8);
        if (!names.length) { jQ('#qw-suggest').hide().empty(); return; }
        var h = names.map(function (n) {
            return '<div class="qw-sugg-row" data-name="' + n + '" style="padding:4px 8px;cursor:pointer;">' + n + '</div>';
        }).join('');
        jQ('#qw-suggest').html(h).show();
    });

    jQ(document).on('click', '.qw-sugg-row', function () {
        var n = jQ(this).data('name');
        selected = { name: n, key: _qwExchangeFor(n) + ':' + n };
        jQ('#qw-search').val(n);
        jQ('#qw-suggest').hide().empty();
    });

    function doFetch() {
        if (!selected) {
            var typed = jQ('#qw-search').val().toUpperCase().trim();
            if (INSTRUMENT_TOKENS[typed] !== undefined) selected = { name: typed, key: _qwExchangeFor(typed) + ':' + typed };
        }
        if (!selected) { jQ('#qw-result').html('<span style="color:var(--gtb-red,#f85149);">Pick an instrument from the suggestions first.</span>'); return; }
        jQ('#qw-result').html('Fetching ' + selected.key + '…');
        _qwFetchQuote(selected.key).then(function (q) {
            if (!q) { jQ('#qw-result').html('<span style="color:var(--gtb-red,#f85149);">No data returned for ' + selected.key + '.</span>'); return; }
            var chg = q.net_change || 0;
            var chgCol = chg > 0 ? 'var(--gtb-green,#3fb950)' : chg < 0 ? 'var(--gtb-red,#f85149)' : 'var(--gtb-muted,#7d8590)';
            var rows = [
                ['LTP', q.last_price],
                ['Change', (chg > 0 ? '+' : '') + chg.toFixed(2), chgCol],
                ['Open', q.ohlc && q.ohlc.open],
                ['High', q.ohlc && q.ohlc.high],
                ['Low', q.ohlc && q.ohlc.low],
                ['Prev Close', q.ohlc && q.ohlc.close],
                ['Volume', q.volume],
                ['OI', q.oi],
                ['Buy Qty', q.buy_quantity],
                ['Sell Qty', q.sell_quantity],
                ['Last Trade Time', q.last_trade_time],
            ];
            var h = '<div style="font-weight:800;margin-bottom:6px;">' + selected.key + '</div>'
                + '<table style="width:100%;border-collapse:collapse;">'
                + rows.map(function (r) {
                    return '<tr><td style="padding:2px 6px;color:var(--gtb-muted,#7d8590);">' + r[0] + '</td>'
                        + '<td style="padding:2px 6px;text-align:right;font-family:monospace;color:' + (r[2] || 'var(--gtb-text,#e6edf3)') + ';">' + (r[1] != null ? r[1] : '—') + '</td></tr>';
                }).join('')
                + '</table>';
            jQ('#qw-result').html(h);
        }).catch(function (err) {
            jQ('#qw-result').html('<span style="color:var(--gtb-red,#f85149);">' + err + '</span>');
        });
    }
    jQ('#qw-fetch-btn').on('click', doFetch);
    jQ('#qw-search').on('keydown', function (e) { if (e.key === 'Enter') doFetch(); });
}

// ── WebSocket subscribe (native WebSocket — not subject to page CORS) ──────────

// Kite exchange segment -> price divisor (same convention as groot-ui's useKiteTicker.ts).
function _qwDivisorForToken(token) {
    var seg = token & 0xff;
    return (seg === 3 || seg === 6) ? 10000000 : 100;
}

// Parses one tick packet out of the ticker's binary frame. Faithful port of groot-ui's
// useKiteTicker.ts parsePacket — see that file for the authoritative byte-offset reference.
function _qwParsePacket(view, offset, size) {
    if (size < 8) return null;
    var token = view.getUint32(offset, false);
    var div = _qwDivisorForToken(token);
    var ltp = view.getUint32(offset + 4, false) / div;
    var tradable = (token & 0xff) !== 9;

    if (size === 8) return { token: token, ltp: ltp, open: 0, high: 0, low: 0, close: 0, change: 0, tradable: tradable };

    if (size === 28 || size === 32) {
        var high = view.getUint32(offset + 8, false) / div;
        var low  = view.getUint32(offset + 12, false) / div;
        var open = view.getUint32(offset + 16, false) / div;
        var close = view.getUint32(offset + 20, false) / div;
        var change = view.getInt32(offset + 24, false) / div;
        return { token: token, ltp: ltp, open: open, high: high, low: low, close: close, change: change, tradable: false };
    }

    if (size >= 44) {
        var open2 = view.getUint32(offset + 28, false) / div;
        var high2 = view.getUint32(offset + 32, false) / div;
        var low2  = view.getUint32(offset + 36, false) / div;
        var close2 = view.getUint32(offset + 40, false) / div;
        var volume = view.getUint32(offset + 16, false);
        // Total buy/sell order quantity — present in the same byte range as open/high/low/
        // close (offsets 20/24, right before OHLC at 28+) on every 'full' mode tick (184
        // bytes), but this parser previously stopped reading at byte 44 and silently
        // dropped everything after — the order-flow imbalance signal (_gtbOrderFlowImbalance
        // in grootTradeBot.js) reads these to answer "will LTP go up or down from here" using
        // live resting-order pressure instead of only lagging 5-min OI/OBV candles.
        var totalBuyQty  = view.getUint32(offset + 20, false);
        var totalSellQty = view.getUint32(offset + 24, false);
        return { token: token, ltp: ltp, open: open2, high: high2, low: low2, close: close2,
                 change: ltp - close2, volume: volume, tradable: true,
                 totalBuyQty: totalBuyQty, totalSellQty: totalSellQty };
    }
    return null;
}

function _qwParseBinaryMessage(buf) {
    var view = new DataView(buf);
    if (view.byteLength < 2) return [];
    var numPackets = view.getUint16(0, false);
    var ticks = [];
    var offset = 2;
    for (var i = 0; i < numPackets; i++) {
        if (offset + 2 > view.byteLength) break;
        var size = view.getUint16(offset, false);
        offset += 2;
        if (offset + size > view.byteLength) break;
        var t = _qwParsePacket(view, offset, size);
        if (t) ticks.push(t);
        offset += size;
    }
    return ticks;
}

var _QW_WS = null;
var _QW_SUBSCRIBED = {}; // token -> name
var _QW_LAST_TICK = {};  // token -> tick

function _qwWsSubscribeAll() {
    if (!_QW_WS || _QW_WS.readyState !== WebSocket.OPEN) return;
    var toks = Object.keys(_QW_SUBSCRIBED).map(Number);
    if (!toks.length) return;
    _QW_WS.send(JSON.stringify({ a: 'subscribe', v: toks }));
    _QW_WS.send(JSON.stringify({ a: 'mode', v: ['full', toks] }));
}

function _qwWsConnect(onStatus) {
    var apiKey = g_config.get('api_key');
    var accessToken = g_config.get('api_access_token');
    if (!accessToken) { onStatus('error', 'No Access Token set — open Settings and set api_access_token'); return; }
    if (_QW_WS) { try { _QW_WS.close(1000); } catch (e) {} }

    var ws = new WebSocket('wss://ws.kite.trade?api_key=' + apiKey + '&access_token=' + accessToken);
    ws.binaryType = 'arraybuffer';
    _QW_WS = ws;

    ws.onopen = function () { onStatus('connected'); _qwWsSubscribeAll(); };
    ws.onclose = function (evt) { onStatus('closed', 'code ' + evt.code); if (_QW_WS === ws) _QW_WS = null; };
    ws.onerror = function () { onStatus('error', 'WebSocket error'); };
    ws.onmessage = function (evt) {
        if (typeof evt.data === 'string') return; // heartbeat/text frame
        var ticks = _qwParseBinaryMessage(evt.data);
        ticks.forEach(function (t) { _QW_LAST_TICK[t.token] = t; });
        if (ticks.length && typeof window._qwOnTick === 'function') window._qwOnTick();
    };
}

function _qwWsDisconnect() {
    if (_QW_WS) { try { _QW_WS.close(1000); } catch (e) {} _QW_WS = null; }
}

function _qwRenderWsTable() {
    var f = function (v) { return (v || v === 0) ? parseFloat(v).toFixed(2) : '—'; };
    var rows = Object.keys(_QW_SUBSCRIBED).map(function (tok) {
        var name = _QW_SUBSCRIBED[tok];
        var t = _QW_LAST_TICK[tok];
        if (!t) return '<tr><td style="padding:3px 6px;">' + name + '</td><td colspan="7" style="padding:3px 6px;color:var(--gtb-muted,#7d8590);">waiting for tick…</td></tr>';
        var chg = t.change || 0;
        var chgCol = chg > 0 ? 'var(--gtb-green,#3fb950)' : chg < 0 ? 'var(--gtb-red,#f85149)' : 'var(--gtb-muted,#7d8590)';
        return '<tr>'
            + '<td style="padding:3px 6px;font-weight:700;">' + name + '</td>'
            + '<td style="padding:3px 6px;text-align:right;font-family:monospace;">' + t.ltp.toFixed(2) + '</td>'
            + '<td style="padding:3px 6px;text-align:right;font-family:monospace;color:' + chgCol + ';">' + (chg > 0 ? '+' : '') + chg.toFixed(2) + '</td>'
            + '<td style="padding:3px 6px;text-align:right;font-family:monospace;color:var(--gtb-muted,#7d8590);">' + f(t.open) + '</td>'
            + '<td style="padding:3px 6px;text-align:right;font-family:monospace;color:var(--gtb-muted,#7d8590);">' + f(t.high) + '</td>'
            + '<td style="padding:3px 6px;text-align:right;font-family:monospace;color:var(--gtb-muted,#7d8590);">' + f(t.low) + '</td>'
            + '<td style="padding:3px 6px;text-align:right;font-family:monospace;color:var(--gtb-muted,#7d8590);">' + f(t.close) + '</td>'
            + '<td style="padding:3px 6px;text-align:right;font-family:monospace;color:var(--gtb-muted,#7d8590);">' + (t.volume || '—') + '</td>'
            + '</tr>';
    }).join('');
    jQ('#qw-ws-table tbody').html(rows || '<tr><td style="padding:6px;color:var(--gtb-muted,#7d8590);">No instruments subscribed yet.</td></tr>');
}

// Pre-populates _QW_SUBSCRIBED with INDICES + NIFTY 50 / BANK NIFTY weighted constituents —
// the same "core universe" convention used across this app (e.g. ALL_INSTR pattern) — so the
// WebSocket popup opens with a useful default list instead of empty, one add-at-a-time start.
// Every subscribable instrument for the search box — was INSTRUMENT_TOKENS only (cash
// equities + indices), so a futures contract like NIFTY26SEPFUT could never be found even
// though it's exactly what the order-flow imbalance signal (_gtbOrderFlowImbalance,
// grootTradeBot.js) needs for index proxies, since indices have no order book of their own.
// Adds FUTURE_INTRUMENT_LIST (NSE/BFO) and COMMODITIES_FUTURE_INSTRUMENT_LIST (MCX/CDS)
// futures, searchable/subscribable by trading symbol.
function _qwSearchableInstruments() {
    var out = [];
    try { Object.keys(INSTRUMENT_TOKENS).forEach(function (n) { out.push({ label: n, token: String(INSTRUMENT_TOKENS[n]), kind: 'Spot/Index' }); }); } catch (e) {}
    try { (typeof FUTURE_INTRUMENT_LIST !== 'undefined' ? FUTURE_INTRUMENT_LIST : []).forEach(function (f) { out.push({ label: f.tradingsymbol, token: String(f.instrument_token), kind: 'NSE/BFO FUT' }); }); } catch (e) {}
    try { (typeof COMMODITIES_FUTURE_INSTRUMENT_LIST !== 'undefined' ? COMMODITIES_FUTURE_INSTRUMENT_LIST : []).forEach(function (f) { out.push({ label: f.tradingsymbol, token: String(f.instrument_token), kind: 'MCX/CDS FUT' }); }); } catch (e) {}
    return out;
}

function _qwDefaultSubscribeList() {
    var names = [].concat(
        INDICES,
        Object.keys(NIFTY_50_WEIGHTED_STOCKS),
        Object.keys(NIFTY_BANK_WEIGHTED_STOCKS)
    );
    var seen = {};
    names.forEach(function (n) {
        if (seen[n]) return;
        seen[n] = true;
        var tok = INSTRUMENT_TOKENS[n];
        if (tok) _QW_SUBSCRIBED[tok] = n;
    });
}

function showWebSocketPopup() {
    var html = ''
        + '<div style="padding:10px;font-size:0.75rem;display:flex;flex-direction:column;height:100%;box-sizing:border-box;">'
        + '  <div style="display:flex;gap:6px;margin-bottom:6px;">'
        + '    <button id="qw-ws-connect" class="gtb-btn" style="padding:4px 10px;">Connect</button>'
        + '    <button id="qw-ws-disconnect" class="gtb-btn" style="padding:4px 10px;">Disconnect</button>'
        + '    <span id="qw-ws-status" style="margin-left:6px;align-self:center;color:var(--gtb-muted,#7d8590);">Not connected</span>'
        + '  </div>'
        + '  <div style="display:flex;gap:6px;margin-bottom:8px;position:relative;">'
        + '    <input id="qw-ws-search" type="text" placeholder="Add instrument to subscribe…" '
        + '           style="flex:1;padding:4px 8px;background:var(--gtb-surface,#161b22);color:var(--gtb-text,#e6edf3);border:1px solid var(--gtb-border,#30363d);" />'
        + '    <div id="qw-ws-suggest" style="position:absolute;top:100%;left:0;right:0;background:var(--gtb-surface,#161b22);border:1px solid var(--gtb-border,#30363d);z-index:20;display:none;max-height:180px;overflow:auto;"></div>'
        + '  </div>'
        + '  <div style="flex:1;overflow:auto;">'
        + '    <table id="qw-ws-table" style="width:100%;border-collapse:collapse;">'
        + '      <thead><tr style="color:var(--gtb-muted,#7d8590);text-align:left;">'
        + '        <th style="padding:3px 6px;">Instrument</th><th style="padding:3px 6px;text-align:right;">LTP</th>'
        + '        <th style="padding:3px 6px;text-align:right;">Chg</th>'
        + '        <th style="padding:3px 6px;text-align:right;">Open</th><th style="padding:3px 6px;text-align:right;">High</th>'
        + '        <th style="padding:3px 6px;text-align:right;">Low</th><th style="padding:3px 6px;text-align:right;">Prev Close</th>'
        + '        <th style="padding:3px 6px;text-align:right;">Vol</th>'
        + '      </tr></thead>'
        + '      <tbody><tr><td style="padding:6px;color:var(--gtb-muted,#7d8590);">No instruments subscribed yet.</td></tr></tbody>'
        + '    </table>'
        + '  </div>'
        + '</div>';

    showPopUpWindow('ws-subscribe', html, 'WebSocket Subscribe', 720, 480);
    var _cls = 'popup-custom-style-ws-subscribe';
    var _title = '<div style="display:flex;align-items:center;gap:6px;width:100%;">'
        + '<span style="font-weight:800;font-size:0.7rem;"><i class="bi bi-broadcast"></i> WEBSOCKET SUBSCRIBE</span>'
        + popupWinControls(_cls)
        + '</div>';
    jQ('.' + _cls).find('.popupwindow_titlebar_text').html(_title);
    hideNativePopupButtons(_cls);
    // Deliberately draggable (unlike most other popups in this app, which remove
    // popupwindow_titlebar_draggable to stop the popup moving on titlebar-padding clicks) —
    // requested explicitly for this popup, so the draggable class is left in place.
    jQ('.' + _cls).toggleClass('gtb-light', (localStorage.getItem('GTB_THEME') || 'dark') === 'light');

    window._qwOnTick = _qwRenderWsTable;

    // Default subscriber list — INDICES + NIFTY 50 / BANK NIFTY weighted constituents — only
    // populated if nothing's subscribed yet (e.g. don't wipe out a list built across a
    // previous open/close of this same popup instance in the same page session).
    if (!Object.keys(_QW_SUBSCRIBED).length) _qwDefaultSubscribeList();

    jQ('#qw-ws-connect').on('click', function () {
        jQ('#qw-ws-status').text('Connecting…');
        _qwWsConnect(function (status, detail) {
            if (status === 'connected') jQ('#qw-ws-status').css('color', 'var(--gtb-green,#3fb950)').text('Connected');
            else if (status === 'closed') jQ('#qw-ws-status').css('color', 'var(--gtb-muted,#7d8590)').text('Closed (' + detail + ')');
            else jQ('#qw-ws-status').css('color', 'var(--gtb-red,#f85149)').text('Error: ' + detail);
        });
    });
    jQ('#qw-ws-disconnect').on('click', function () {
        _qwWsDisconnect();
        jQ('#qw-ws-status').css('color', 'var(--gtb-muted,#7d8590)').text('Disconnected');
    });

    jQ('#qw-ws-search').on('input', function () {
        var q = jQ(this).val().toUpperCase().trim();
        if (q.length < 1) { jQ('#qw-ws-suggest').hide().empty(); return; }
        var matches = _qwSearchableInstruments().filter(function (it) {
            return it.label.indexOf(q) !== -1 && !_QW_SUBSCRIBED[it.token];
        }).slice(0, 10);
        if (!matches.length) { jQ('#qw-ws-suggest').hide().empty(); return; }
        var h = matches.map(function (it) {
            return '<div class="qw-ws-sugg-row" data-name="' + it.label + '" data-token="' + it.token + '" style="padding:4px 8px;cursor:pointer;display:flex;justify-content:space-between;gap:8px;">'
                + '<span>' + it.label + '</span><span style="color:var(--gtb-muted,#7d8590);font-size:0.7em;">' + it.kind + '</span></div>';
        }).join('');
        jQ('#qw-ws-suggest').html(h).show();
    });

    jQ(document).on('click', '.qw-ws-sugg-row', function () {
        var n = jQ(this).data('name');
        var tok = jQ(this).data('token');
        if (!tok) return;
        _QW_SUBSCRIBED[tok] = n;
        jQ('#qw-ws-search').val('');
        jQ('#qw-ws-suggest').hide().empty();
        _qwRenderWsTable();
        _qwWsSubscribeAll(); // re-sends the full subscribe list, safe if already connected
    });

    // Clean up the socket when this popup is closed, so it doesn't keep running invisibly.
    jQ('#' + 'pop-up-window-ws-subscribe').on('close.popupwindow', function () {
        _qwWsDisconnect();
        window._qwOnTick = null;
    });

    _qwRenderWsTable();
}
