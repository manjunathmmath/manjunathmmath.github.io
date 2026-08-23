// ─── dataLoad.js ────────────────────────────────────────────────────────────
// "Data Load" popup — two independent loaders:
//   1. Kite Instruments  → fetches the full Kite instrument master dump (all
//      exchanges/segments) via GM_xmlhttpRequest (bypasses CORS, same pattern
//      quoteWs.js already uses) and caches it in browser IndexedDB, shown in a
//      searchable table.
//   2. Strike Intervals  → fetches NSE_FO_SosScheme.csv (the same source
//      NSE_STRIKE_DIFF in constants.js was originally hand-populated from) and
//      caches symbol → step-value pairs in localStorage, shown in a searchable
//      table. This does NOT overwrite NSE_STRIKE_DIFF — it's a separate,
//      independently-refreshable reference table.
// ─────────────────────────────────────────────────────────────────────────────

// ── IndexedDB (Kite instrument master) ──────────────────────────────────────
var _DL_DB_NAME = 'groot-tm-instruments-db';
var _DL_DB_VERSION = 1;
var _DL_STORE = 'instruments';

function _dlOpenDb() {
    return new Promise(function (resolve, reject) {
        var req = indexedDB.open(_DL_DB_NAME, _DL_DB_VERSION);
        req.onupgradeneeded = function () {
            var db = req.result;
            if (!db.objectStoreNames.contains(_DL_STORE)) {
                var store = db.createObjectStore(_DL_STORE, { keyPath: 'token' });
                store.createIndex('tradingsymbol', 'tradingsymbol', { unique: false });
                store.createIndex('name', 'name', { unique: false });
            }
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
    });
}

function _dlPutInstruments(rows) {
    return _dlOpenDb().then(function (db) {
        return new Promise(function (resolve, reject) {
            var tx = db.transaction(_DL_STORE, 'readwrite');
            tx.objectStore(_DL_STORE).clear();
            rows.forEach(function (r) { tx.objectStore(_DL_STORE).put(r); });
            tx.oncomplete = function () { resolve(); };
            tx.onerror = function () { reject(tx.error); };
        }).then(function () {
            db.close();
            localStorage.setItem('DL_INSTRUMENTS_CACHED_AT', new Date().toISOString());
        });
    });
}

function _dlGetAllInstruments() {
    return _dlOpenDb().then(function (db) {
        return new Promise(function (resolve, reject) {
            var tx = db.transaction(_DL_STORE, 'readonly');
            var req = tx.objectStore(_DL_STORE).getAll();
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error); };
        }).then(function (rows) { db.close(); return rows; });
    });
}

// Quote-aware CSV field split (RFC4180-ish) — a plain line.split(',') silently misaligns
// every column the moment a `name` field contains a literal comma (real risk in company
// name data, e.g. "L&T Finance Holdings, Ltd" style entries), corrupting exchange/
// segment/instrument_type/etc for that row without any visible error. Used by both CSV
// parsers below.
function _dlSplitCsvLine(line) {
    var out = [], cur = '', inQuotes = false;
    for (var i = 0; i < line.length; i++) {
        var ch = line[i];
        if (inQuotes) {
            if (ch === '"') {
                if (line[i + 1] === '"') { cur += '"'; i++; }
                else inQuotes = false;
            } else cur += ch;
        } else if (ch === '"') inQuotes = true;
        else if (ch === ',') { out.push(cur); cur = ''; }
        else cur += ch;
    }
    out.push(cur);
    return out;
}

// ── Kite instrument master CSV fetch ────────────────────────────────────────
// Columns: instrument_token,exchange_token,tradingsymbol,name,last_price,expiry,
//          strike,tick_size,lot_size,instrument_type,segment,exchange
function _dlParseInstrumentsCsv(text) {
    var lines = text.split('\n');
    var out = [];
    for (var i = 1; i < lines.length; i++) { // skip header row
        var line = lines[i];
        if (!line || !line.trim()) continue;
        var c = _dlSplitCsvLine(line);
        if (c.length < 12) continue;
        out.push({
            token: parseInt(c[0], 10),
            tradingsymbol: c[2],
            name: c[3],
            expiry: c[5] || null,
            strike: c[6] ? parseFloat(c[6]) : null,
            lot_size: c[8] ? parseInt(c[8], 10) : null,
            instrument_type: c[9],
            segment: c[10],
            exchange: c[11] ? c[11].trim() : '',
        });
    }
    return out;
}

function _dlFetchKiteInstruments() {
    var apiKey = g_config.get('api_key');
    var accessToken = g_config.get('api_access_token');
    return new Promise(function (resolve, reject) {
        if (!accessToken) { reject('No Access Token set — open Settings and set api_access_token'); return; }
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://api.kite.trade/instruments',
            headers: { 'Authorization': 'token ' + apiKey + ':' + accessToken },
            onload: function (res) {
                if (res.status !== 200) { reject('HTTP ' + res.status + ' — check API Key/Access Token in Settings'); return; }
                try { resolve(_dlParseInstrumentsCsv(res.responseText)); }
                catch (e) { reject('Failed to parse instruments CSV: ' + e.message); }
            },
            onerror: function () { reject('Request failed (network error or CORS still blocked)'); },
            ontimeout: function () { reject('Request timed out'); },
        });
    });
}

// ── NSE strike-interval CSV fetch (NSE_FO_SosScheme.csv) ───────────────────
// Row format (skip date row + header row): Symbol, Month type, Symbol Type, Step Value, ...
// NSE lists MULTIPLE rows per (symbol, month type) — one per "Symbol Type" — so a
// symbol's real step range for a month is MIN..MAX across all its rows, not just
// whichever row happened to appear last (matches groot-platform's proven backend SQL).
function _dlParseStrikeCsv(text) {
    var lines = text.split('\n');
    var out = {};
    for (var i = 2; i < lines.length; i++) {
        var line = lines[i];
        if (!line || !line.trim()) continue;
        var c = _dlSplitCsvLine(line);
        if (c.length < 4) continue;
        var symbol = c[0].trim(), monthType = c[1].trim(), step = parseFloat(c[3]);
        if (!symbol || !monthType || isNaN(step)) continue;
        if (!out[symbol]) out[symbol] = {};
        if (!out[symbol][monthType]) out[symbol][monthType] = [];
        out[symbol][monthType].push(step);
    }
    return out;
}

// symbol -> "min,max" (or just "min" if min===max) for one month type — the exact
// format NSE_STRIKE_DIFF/NSE_FUTURE_STRIKE_DIFF in constants.js already use.
function _dlStrikeDiffString(steps) {
    if (!steps || !steps.length) return null;
    var min = Math.min.apply(null, steps), max = Math.max.apply(null, steps);
    return (min === max) ? String(min) : (min + ',' + max);
}

function _dlFetchStrikeIntervals() {
    return new Promise(function (resolve, reject) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://nsearchives.nseindia.com/content/fo/NSE_FO_SosScheme.csv',
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': '*/*' },
            onload: function (res) {
                if (res.status !== 200) { reject('HTTP ' + res.status); return; }
                try { resolve(_dlParseStrikeCsv(res.responseText)); }
                catch (e) { reject('Failed to parse strike CSV: ' + e.message); }
            },
            onerror: function () { reject('Request failed (network error or CORS still blocked)'); },
            ontimeout: function () { reject('Request timed out'); },
        });
    });
}

// ── Popup shell ──────────────────────────────────────────────────────────────
function _dlShowPopup() {
    var html = '<div class="dl-wrap">'
        + '<div class="dl-section">'
        +   '<div class="dl-section-title">KITE INSTRUMENTS</div>'
        +   '<div class="dl-row">'
        +     '<div class="dl-row-info"><b>Sync + cache in browser (IndexedDB)</b>'
        +       '<div id="dl-instr-sub" class="dl-row-sub">' + _dlInstrSubText() + '</div></div>'
        +     '<button id="dl-instr-load" class="sv-load-btn"><i class="bi bi-cloud-download"></i> Load</button>'
        +   '</div>'
        +   '<input type="text" id="dl-instr-search" class="dl-search" placeholder="Search cached instruments…" style="display:none;">'
        +   '<div id="dl-instr-table"></div>'
        + '</div>'
        + '<div class="dl-section">'
        +   '<div class="dl-section-title">STRIKE INTERVALS</div>'
        +   '<div class="dl-row">'
        +     '<div class="dl-row-info"><b>Sync NSE_FO_SosScheme.csv</b>'
        +       '<div id="dl-strike-sub" class="dl-row-sub">' + _dlStrikeSubText() + '</div></div>'
        +     '<button id="dl-strike-load" class="sv-load-btn"><i class="bi bi-cloud-download"></i> Load</button>'
        +   '</div>'
        +   '<input type="text" id="dl-strike-search" class="dl-search" placeholder="Search strike intervals…" style="display:none;">'
        +   '<div id="dl-strike-table"></div>'
        + '</div>'
        + '</div>';

    showPopUpWindow('data-load-popup', html, 'Data Load', 640, 640);
    var cls = 'popup-custom-style-data-load-popup';
    var title = '<div style="display:flex;align-items:center;gap:6px;width:100%;">'
        + '<i class="bi bi-hdd-fill"></i><span style="font-weight:800;font-size:0.7rem;">DATA LOAD</span>'
        + popupWinControls(cls)
        + '</div>';
    jQ('.' + cls).find('.popupwindow_titlebar_text').html(title);
    hideNativePopupButtons(cls);
    jQ('.' + cls).find('.popupwindow_titlebar').removeClass('popupwindow_titlebar_draggable');
    jQ('.' + cls).find('.popupwindow_content').css({ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: '0' });
    jQ('.' + cls).toggleClass('gtb-light', (localStorage.getItem('GTB_THEME') || 'dark') === 'light');

    // Restore whatever's already cached, without requiring another Load click.
    _dlGetAllInstruments().then(function (rows) { if (rows && rows.length) { _DL_INSTRUMENTS = rows; _dlRenderInstrTable(); } }).catch(function () {});
    var cachedStrikes = _dlLoadCachedStrikes();
    if (cachedStrikes) { _DL_STRIKES = cachedStrikes; _dlRenderStrikeTable(); }
}

function _dlInstrSubText() {
    var at = localStorage.getItem('DL_INSTRUMENTS_CACHED_AT');
    return at ? ('Cached · last loaded ' + new Date(at).toLocaleString()) : 'Not loaded into this browser yet';
}
function _dlStrikeSubText() {
    var at = localStorage.getItem('DL_STRIKES_CACHED_AT');
    return at ? ('Cached · last loaded ' + new Date(at).toLocaleString()) : 'Not loaded into this browser yet';
}
function _dlLoadCachedStrikes() {
    try { return JSON.parse(localStorage.getItem('DL_STRIKE_INTERVALS') || 'null'); } catch (e) { return null; }
}

var _DL_INSTRUMENTS = [];
var _DL_STRIKES = null;

jQ(document).on('click', '#dl-instr-load', function () {
    var $btn = jQ(this).prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Loading…');
    _dlFetchKiteInstruments().then(function (rows) {
        return _dlPutInstruments(rows).then(function () {
            _DL_INSTRUMENTS = rows;
            jQ('#dl-instr-sub').text(rows.length.toLocaleString() + ' instruments — ' + _dlInstrSubText());
            _dlRenderInstrTable();
            _gtbToast('Kite instruments loaded (' + rows.length.toLocaleString() + ' rows)', 'success');
        });
    }).catch(function (err) {
        _gtbToast('Instrument load failed: ' + err, 'error');
    }).finally(function () {
        $btn.prop('disabled', false).html('<i class="bi bi-cloud-download"></i> Load');
    });
});

jQ(document).on('click', '#dl-strike-load', function () {
    var $btn = jQ(this).prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Loading…');
    _dlFetchStrikeIntervals().then(function (map) {
        _DL_STRIKES = map;
        localStorage.setItem('DL_STRIKE_INTERVALS', JSON.stringify(map));
        localStorage.setItem('DL_STRIKES_CACHED_AT', new Date().toISOString());
        jQ('#dl-strike-sub').text(Object.keys(map).length + ' symbols — ' + _dlStrikeSubText());
        _dlRenderStrikeTable();
        _gtbToast('Strike intervals loaded (' + Object.keys(map).length + ' symbols)', 'success');
    }).catch(function (err) {
        _gtbToast('Strike interval load failed: ' + err, 'error');
    }).finally(function () {
        $btn.prop('disabled', false).html('<i class="bi bi-cloud-download"></i> Load');
    });
});

function _dlRenderInstrTable(filter) {
    jQ('#dl-instr-search').show();
    var q = (filter || jQ('#dl-instr-search').val() || '').trim().toUpperCase();
    var rows = q
        ? _DL_INSTRUMENTS.filter(function (r) { return r.tradingsymbol.indexOf(q) !== -1 || (r.name || '').toUpperCase().indexOf(q) !== -1; })
        : _DL_INSTRUMENTS;
    var shown = rows.slice(0, 300);
    var html = '<div class="dl-table">'
        + '<div class="dl-table-head"><span>Symbol</span><span>Name</span><span>Exch</span><span>Type</span><span>Expiry</span><span>Strike</span></div>'
        + '<div class="dl-table-body">'
        + shown.map(function (r) {
            return '<div class="dl-table-row"><span class="dl-cell-strong">' + r.tradingsymbol + '</span><span class="dl-cell-muted">' + (r.name || '—') + '</span>'
                + '<span class="dl-cell-muted">' + (r.exchange || '—') + '</span><span class="dl-cell-muted">' + (r.instrument_type || '—') + '</span>'
                + '<span class="dl-cell-muted">' + (r.expiry || '—') + '</span><span class="dl-cell-muted">' + (r.strike || '—') + '</span></div>';
        }).join('')
        + '</div>'
        + (rows.length > shown.length ? '<div class="dl-table-more">Showing ' + shown.length + ' of ' + rows.length.toLocaleString() + ' matches — narrow the search to see more.</div>' : '')
        + '</div>';
    jQ('#dl-instr-table').html(html);
}
jQ(document).on('input', '#dl-instr-search', function () { _dlRenderInstrTable(jQ(this).val()); });

function _dlRenderStrikeTable(filter) {
    jQ('#dl-strike-search').show();
    if (!_DL_STRIKES) return;
    var q = (filter || jQ('#dl-strike-search').val() || '').trim().toUpperCase();
    var symbols = Object.keys(_DL_STRIKES).sort();
    if (q) symbols = symbols.filter(function (s) { return s.indexOf(q) !== -1; });
    var shown = symbols.slice(0, 300);
    var html = '<div class="dl-table dl-table-4col">'
        + '<div class="dl-table-head"><span>Symbol</span><span>M1</span><span>M2</span><span>M3</span></div>'
        + '<div class="dl-table-body">'
        + shown.map(function (s) {
            var m = _DL_STRIKES[s];
            return '<div class="dl-table-row dl-table-row-4col"><span class="dl-cell-strong">' + s + '</span><span class="dl-cell-muted">' + (_dlStrikeDiffString(m.M1) || '—') + '</span>'
                + '<span class="dl-cell-muted">' + (_dlStrikeDiffString(m.M2) || '—') + '</span><span class="dl-cell-muted">' + (_dlStrikeDiffString(m.M3) || '—') + '</span></div>';
        }).join('')
        + '</div>'
        + (symbols.length > shown.length ? '<div class="dl-table-more">Showing ' + shown.length + ' of ' + symbols.length + ' matches — narrow the search to see more.</div>' : '')
        + '</div>';
    jQ('#dl-strike-table').html(html);
}
jQ(document).on('input', '#dl-strike-search', function () { _dlRenderStrikeTable(jQ(this).val()); });
