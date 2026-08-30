// ─── positionalScreener.js ──────────────────────────────────────────────────
// Swing/positional screener — scans all F&O stocks on DAILY candles (not the
// 5-min intraday series every other tool in this app uses) for multi-day setups:
// trend structure (price vs SMA20/50), 20-day breakout/breakdown, relative
// strength vs NIFTY 50, and multi-day futures OI buildup (rising OI + rising
// price = long buildup, rising OI + falling price = short buildup, etc.).
//
// ISOLATION: standalone file, only reads existing globals (FO_LIST,
// INSTRUMENT_TOKENS, FUTURE_INTRUMENT_LIST, getHistoricalDataUsingPromise) —
// never writes INSTRUMENT_SCORE_MAP or any other live-shared cache, and never
// calls any of the existing intraday scoring functions. Nothing in the rest of
// the app is touched or behaves any differently with this file absent.
// ─────────────────────────────────────────────────────────────────────────────

var _PS_CACHE = {}; // _PS_CACHE[name] = { candles, futCandles, ...computed fields }

jQ(document).on('click', '#show-positional-screener', function (e) {
    e.preventDefault();
    _psShowPopup();
});

// ── Content HTML — shared by the standalone popup AND the "Positional" dashboard tab.
// All ids are global (not container-scoped), same as the rest of this app's popups —
// only one of {popup, tab} is expected to be on-screen at a time in normal use.
// Selection UI mirrors Stock Viewer's own filter bar + chip panel exactly (same
// classes/UX: category segment buttons open a chip panel, chips toggle selected) — plus
// a search+autocomplete box (same pattern as backtest.js's instrument picker) to add any
// symbol directly regardless of which category filter is active, for genuine multi-select.
function _psContentHtml() {
    var counts = _psCategoryCounts();
    return '<div class="ps-wrap">'
        // ── Filter bar ───────────────────────────────────────────────────────
        + '<div id="ps-filter-row">'
        +   '<div class="sv-seg-group">'
        +     _psSegBtn('all',    'ALL',        counts.all,    '')
        +     _psSegBtn('aso',    'ASO',        counts.aso,    'green')
        +     _psSegBtn('bso',    'BSO',        counts.bso,    'red')
        +     _psSegBtn('nine15', '9:15',       counts.nine15, 'gold')
        +     _psSegBtn('n50',    'NIFTY 50',   null,          '')
        +     _psSegBtn('bank',   'BANK NIFTY', null,          '')
        +     _psSegBtn('weight', 'WEIGHTED',   null,          '')
        +     _psSegBtn('idx',    'INDEX + MCX', null,         '')
        +   '</div>'
        + '</div>'
        // ── Chip panel: search-autocomplete add + category chip list ───────────
        + '<div id="ps-chip-panel">'
        +   '<div id="ps-chip-controls">'
        +     '<span id="ps-chip-label">SELECT INSTRUMENTS</span>'
        +     '<div class="bt-bk-search" style="min-width:200px;flex:0 0 auto;">'
        +       '<input type="text" id="ps-add-input" placeholder="Add symbol…" autocomplete="off">'
        +       '<button id="ps-add-btn" class="fsig-add-btn"><i class="bi bi-plus-circle"></i> Add</button>'
        +       '<div id="ps-add-ac-drop" class="fsig-ac-drop" style="position:fixed;"></div>'
        +     '</div>'
        +     '<div style="display:flex;gap:4px;">'
        +       '<button id="ps-chip-select-all" class="sv-pill-btn" type="button">All</button>'
        +       '<button id="ps-chip-select-none" class="sv-pill-btn" type="button">None</button>'
        +     '</div>'
        +     '<button id="ps-scan-btn" class="sv-load-btn" type="button"><i class="bi bi-play-fill"></i> SCAN</button>'
        +   '</div>'
        +   '<div id="ps-chip-list"></div>'
        + '</div>'
        // ── Results controls + table ────────────────────────────────────────────
        + '<div class="ps-controls">'
        +   '<span id="ps-progress" class="ps-progress"></span>'
        +   '<span id="ps-summary" class="ps-summary"></span>'
        +   '<select id="ps-filter" class="sv-pill-btn">'
        +     '<option value="all">All</option>'
        +     '<option value="buy">BUY / STRONG BUY</option>'
        +     '<option value="sell">SELL / STRONG SELL</option>'
        +     '<option value="watch">WATCH</option>'
        +   '</select>'
        +   '<select id="ps-sort" class="sv-pill-btn">'
        +     '<option value="score">Sort: Score</option>'
        +     '<option value="name">Sort: Name</option>'
        +     '<option value="rs">Sort: Rel Strength</option>'
        +   '</select>'
        +   '<input type="text" id="ps-search" class="dl-search" style="width:140px;margin:0;" placeholder="Search results…">'
        + '</div>'
        + '<div id="ps-table-wrap" class="ps-table-wrap">'
        +   '<div class="sv-empty-state"><i class="bi bi-funnel-fill"></i><span>Choose a filter above, or add symbols by search, then click SCAN</span></div>'
        + '</div>'
        + '</div>';
}

function _psShowPopup() {
    showPopUpWindow('positional-screener', _psContentHtml(), 'Positional Screener', 1150, 700);
    var cls = 'popup-custom-style-positional-screener';
    var title = '<div style="display:flex;align-items:center;gap:6px;width:100%;">'
        + '<i class="bi bi-funnel-fill"></i><span style="font-weight:800;font-size:0.7rem;">POSITIONAL SCREENER (SWING)</span>'
        + (typeof _ii === 'function' ? _ii('ps-overview') : '')
        + popupWinControls(cls)
        + '</div>';
    jQ('.' + cls).find('.popupwindow_titlebar_text').html(title);
    hideNativePopupButtons(cls);
    jQ('.' + cls).find('.popupwindow_titlebar').removeClass('popupwindow_titlebar_draggable');
    jQ('.' + cls).find('.popupwindow_content').css({ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: '0', position: 'relative' });
    jQ('.' + cls).toggleClass('gtb-light', (localStorage.getItem('GTB_THEME') || 'dark') === 'light');

    if (Object.keys(_PS_CACHE).length) _psRenderTable(); // restore last scan, if any, without re-fetching
}

// ── Dashboard tab entry point — renders the SAME content into the tab pane instead of a
// popup window. Only builds once (matches the app's own "manages its own DOM" convention
// for tabs like Trade/Dashboard — see _GTB_PANE_GRIDS) so switching away and back doesn't
// reset the chip selection or wipe a scan already in progress/completed.
function _psRenderInPane() {
    var $pane = jQ('#gtb-pane-positional');
    if (!$pane.length) return;
    if (!$pane.find('.ps-wrap').length) {
        $pane.html(_psContentHtml());
    }
    if (Object.keys(_PS_CACHE).length) _psRenderTable(); // keep results in sync on every tab activation
}

function _psSegBtn(filter, label, count, color) {
    var countHtml = count != null ? '<span class="sv-seg-count">' + count + '</span>' : '';
    return '<button class="sv-seg-btn ps-seg-btn" data-psfilter="' + filter + '" data-color="' + color + '" type="button">'
        + '<span class="sv-seg-label">' + label + '</span>' + countHtml + '</button>';
}

// ── Instrument list builder — scoped to what this screener actually supports (F&O
// stocks + the always-available indices/MCX), NOT the full INSTRUMENT_TOKENS universe
// Stock Viewer's own _svBuildList reads, since a non-F&O name has no futures OI to score.
function _psCategoryCounts() {
    var out = { all: (typeof FO_LIST !== 'undefined' ? FO_LIST.length : 0), aso: 0, bso: 0, nine15: 0 };
    try {
        var scriptData = generateTrends();
        var breakOut915 = JSON.parse(localStorage.getItem('VALID_BREAKOUT_NINE_FIFTEEN')) || {};
        (typeof FO_LIST !== 'undefined' ? FO_LIST : []).forEach(function (name) {
            var trends = scriptData[name] ? scriptData[name]['trends'] : [];
            var c915 = breakOut915[name] && breakOut915[name]['CLOSE_9_15'];
            if (jQ.inArray('ASO', trends) !== -1) out.aso++;
            if (jQ.inArray('BSO', trends) !== -1) out.bso++;
            if (c915 === 'ASO' || c915 === 'BSO') out.nine15++;
        });
    } catch (e) {}
    return out;
}

function _psBuildList(type) {
    if (type === 'idx') return _PS_EXTRA_INSTRUMENTS.slice();
    var list = [];
    var scriptData = generateTrends();
    var breakOut915 = JSON.parse(localStorage.getItem('VALID_BREAKOUT_NINE_FIFTEEN')) || {};
    (typeof FO_LIST !== 'undefined' ? FO_LIST : []).forEach(function (name) {
        var trends = scriptData[name] ? scriptData[name]['trends'] : [];
        var c915 = breakOut915[name] && breakOut915[name]['CLOSE_9_15'];
        if (type === 'all') { list.push(name); return; }
        if (type === 'aso' && jQ.inArray('ASO', trends) !== -1) list.push(name);
        if (type === 'bso' && jQ.inArray('BSO', trends) !== -1) list.push(name);
        if (type === 'nine15' && (c915 === 'ASO' || c915 === 'BSO')) list.push(name);
        if (type === 'n50' && typeof NIFTY_50_LIST !== 'undefined' && jQ.inArray(name, NIFTY_50_LIST) !== -1) list.push(name);
        if (type === 'bank' && typeof NIFTY_BANK_LIST !== 'undefined' && jQ.inArray(name, NIFTY_BANK_LIST) !== -1) list.push(name);
        if (type === 'weight' && typeof WEIGHTED_STOCKS !== 'undefined' && jQ.inArray(name, WEIGHTED_STOCKS) !== -1) list.push(name);
    });
    return list;
}

// ── Chip panel ────────────────────────────────────────────────────────────────
function _psShowChipPanel(list) {
    var chipsHtml = list.map(function (name) {
        return '<div class="sv-chip sv-chip-selected" data-name="' + name + '"><span class="sv-chip-name">' + name + '</span></div>';
    }).join('');
    jQ('#ps-chip-list').html(chipsHtml);
    jQ('#ps-chip-panel').show();
    _psUpdateScanCount();
}
jQ(document).on('click', '.ps-seg-btn', function () {
    jQ('.ps-seg-btn').removeClass('sv-seg-active');
    jQ(this).addClass('sv-seg-active');
    _psShowChipPanel(_psBuildList(jQ(this).attr('data-psfilter')));
});
jQ(document).on('click', '#ps-chip-panel .sv-chip', function () { jQ(this).toggleClass('sv-chip-selected'); _psUpdateScanCount(); });
jQ(document).on('click', '#ps-chip-select-all', function () { jQ('#ps-chip-panel .sv-chip').addClass('sv-chip-selected'); _psUpdateScanCount(); });
jQ(document).on('click', '#ps-chip-select-none', function () { jQ('#ps-chip-panel .sv-chip').removeClass('sv-chip-selected'); _psUpdateScanCount(); });

function _psUpdateScanCount() {
    var n = jQ('#ps-chip-panel .sv-chip.sv-chip-selected').length;
    jQ('#ps-scan-btn').html('<i class="bi bi-play-fill"></i> SCAN' + (n ? ' (' + n + ')' : ''));
}

// ── Search + autocomplete "Add" — lets a symbol be added regardless of which category
// filter is active, e.g. add one stock from outside NIFTY 50 while that filter is shown.
function _psAllNames() {
    var seen = {}, list = [];
    function add(n) { n = (n || '').trim().toUpperCase(); if (n && !seen[n]) { seen[n] = 1; list.push(n); } }
    (typeof FO_LIST !== 'undefined' ? FO_LIST : []).forEach(add);
    _PS_EXTRA_INSTRUMENTS.forEach(add);
    return list.sort();
}
function _psAddChip(name) {
    if (!jQ('#ps-chip-panel').is(':visible')) jQ('#ps-chip-panel').show();
    var $existing = jQ('#ps-chip-list .sv-chip[data-name="' + name + '"]');
    if ($existing.length) { $existing.addClass('sv-chip-selected'); }
    else { jQ('#ps-chip-list').append('<div class="sv-chip sv-chip-selected" data-name="' + name + '"><span class="sv-chip-name">' + name + '</span></div>'); }
    _psUpdateScanCount();
}
jQ(document).on('input', '#ps-add-input', function () {
    var q = jQ(this).val().trim().toUpperCase();
    var $drop = jQ('#ps-add-ac-drop');
    if (!q) { $drop.empty().hide(); return; }
    var items = _psAllNames().filter(function (n) { return n.indexOf(q) !== -1; }).slice(0, 12);
    if (!items.length) { $drop.empty().hide(); return; }
    var html = items.map(function (n) { return '<div class="fsig-ac-item" data-name="' + n + '">' + n + '</div>'; }).join('');
    var rect = this.getBoundingClientRect();
    $drop.html(html).css({ top: (rect.bottom + 2) + 'px', left: rect.left + 'px', width: rect.width + 'px' }).show();
});
jQ(document).on('click', '#ps-add-ac-drop .fsig-ac-item', function () {
    _psAddChip(jQ(this).attr('data-name'));
    jQ('#ps-add-input').val('');
    jQ('#ps-add-ac-drop').empty().hide();
});
jQ(document).on('click', '#ps-add-btn', function () {
    var name = jQ('#ps-add-input').val().trim().toUpperCase();
    if (name) _psAddChip(name);
    jQ('#ps-add-input').val('');
    jQ('#ps-add-ac-drop').empty().hide();
});
jQ(document).on('keydown', '#ps-add-input', function (e) { if (e.key === 'Enter') jQ('#ps-add-btn').click(); });
jQ(document).on('click', function (e) {
    if (!jQ(e.target).closest('#ps-add-ac-drop, #ps-add-input').length) jQ('#ps-add-ac-drop').empty().hide();
});

// ── Data fetch (daily candles, rate-limited via the app's existing hist queue) ──
// NOT d.toISOString() — that converts to UTC first, and IST is UTC+5:30, so any run
// between midnight and 5:30 AM IST would silently resolve "today" to the previous
// calendar day. Use local date components directly instead.
function _psDateStr(d) {
    var y = d.getFullYear(), m = ('0' + (d.getMonth() + 1)).slice(-2), day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
}

async function _psFetchDaily(token, days) {
    // "Today" here is Tampermonkey's configured CURRENT_DAY (Settings → current_day_date),
    // the same convention every other historical fetch in this app uses (_gtbCurrDay()) —
    // NOT the real wall-clock date. CURRENT_DAY defaults to today but can be overridden,
    // e.g. to review a specific past session; new Date() would silently ignore that.
    var to = (typeof CURRENT_DAY !== 'undefined' && CURRENT_DAY) ? new Date(CURRENT_DAY + 'T00:00:00') : new Date();
    var from = new Date(to); from.setDate(from.getDate() - days);
    // Respect the app-wide snapshot-time picker (#gtb-hist-time / _gtbHistTime()) the same
    // way every other historical fetch does — a 'day'-interval candle for TODAY reflects
    // the true live intraday state and can't be truncated mid-session by date alone, so
    // this only actually matters for today's own (last) candle; every earlier day in the
    // series is a completed session regardless. Falls back to market close (15:30) when
    // no snapshot time is set, same as before.
    var histTime = (typeof _gtbHistTime === 'function') ? _gtbHistTime() : null;
    var toTime = histTime || '15:30';
    var raw = await getHistoricalDataUsingPromise(token, _psDateStr(from) + ' 09:00:00', _psDateStr(to) + ' ' + toTime + ':00', 'day');
    return (raw && raw.data && raw.data.candles) ? raw.data.candles : [];
}

// Indices/MCX use different naming + token sources than F&O stocks — same mapping
// convention as backtest.js/optionStrikeSearch.js (display name -> exchange-native name).
var _PS_INDEX_NAMES = { 'NIFTY 50': 'NIFTY', 'NIFTY BANK': 'BANKNIFTY' };
var _PS_MCX_NAMES = ['CRUDEOILM'];
// Scanned alongside FO_LIST — indices/MCX have no daily "trend" of their own the way a
// stock does in the strictest sense, but the same SMA/breakout/RS/OI math applies fine to
// their own price series.
var _PS_EXTRA_INSTRUMENTS = ['NIFTY 50', 'NIFTY BANK', 'CRUDEOILM'];

// Spot/price token for the daily candle fetch. Stocks (INSTRUMENT_TOKENS) unchanged;
// NIFTY 50/NIFTY BANK also come from INSTRUMENT_TOKENS (already carries indices); MCX
// names have no separate spot instrument at all — the near-month FUT contract itself is
// what's traded, so its own token doubles as both price AND OI source.
function _psPriceTokenFor(name) {
    if (_PS_MCX_NAMES.indexOf(name) !== -1) return _psFutTokenFor(name);
    return (typeof INSTRUMENT_TOKENS !== 'undefined') ? INSTRUMENT_TOKENS[name] : null;
}

function _psFutEntryFor(name) {
    var exchName = _PS_INDEX_NAMES[name] || name;
    if (_PS_MCX_NAMES.indexOf(name) !== -1) {
        if (typeof COMMODITIES_FUTURE_INSTRUMENT_LIST === 'undefined') return null;
        return COMMODITIES_FUTURE_INSTRUMENT_LIST.find(function (r) { return r.name === exchName; }) || null;
    }
    if (typeof FUTURE_INTRUMENT_LIST === 'undefined') return null;
    return FUTURE_INTRUMENT_LIST.find(function (r) { return r.name === exchName; }) || null;
}
function _psFutTokenFor(name) {
    var e = _psFutEntryFor(name);
    return e ? e.instrument_token : null;
}

// Trading days remaining to the near-month contract's expiry, as of CURRENT_DAY — near-
// month futures OI structurally DECLINES in the last few sessions before expiry as
// positions roll into the next month, regardless of actual bullish/bearish conviction.
// That rollover effect swamps the 5-day OI comparison below, making almost every stock
// read as OI-down (SHORT COVERING / LONG UNWINDING only, never a genuine buildup) — this
// is what the buildup classification needs to detect and flag rather than silently report.
// expiry format from Kite is "DD-MM-YYYY" or "YYYY-MM-DD" depending on source list; handle both.
function _psDaysToExpiry(expiryStr) {
    if (!expiryStr) return null;
    var d;
    if (/^\d{4}-\d{2}-\d{2}/.test(expiryStr)) {
        d = new Date(expiryStr.slice(0, 10) + 'T00:00:00');
    } else if (/^\d{2}-\d{2}-\d{4}/.test(expiryStr)) {
        var parts = expiryStr.slice(0, 10).split('-');
        d = new Date(parts[2] + '-' + parts[1] + '-' + parts[0] + 'T00:00:00');
    } else return null;
    var today = (typeof CURRENT_DAY !== 'undefined' && CURRENT_DAY) ? new Date(CURRENT_DAY + 'T00:00:00') : new Date();
    return Math.round((d - today) / 86400000);
}

// Kite chart link needs the right exchange segment + token per instrument class.
function _psChartLink(name, token) {
    var exch = _PS_MCX_NAMES.indexOf(name) !== -1 ? 'MCX'
        : (name === 'NIFTY 50' || name === 'NIFTY BANK') ? 'NSE' : 'NSE';
    return 'https://kite.zerodha.com/markets/ext/chart/web/tvc/' + exch + '/' + name + '/' + (token || '');
}

// ── Pure scoring math (daily candles in, verdict out — no live-cache reads) ────
function _psSma(closes, period) {
    if (closes.length < period) return null;
    var slice = closes.slice(closes.length - period);
    return slice.reduce(function (a, b) { return a + b; }, 0) / period;
}

function _psComputeSetup(candles, futCandles, niftyPctChg20, futToken, daysToExpiry) {
    if (!candles || candles.length < 25) return null;
    var closes = candles.map(function (c) { return parseFloat(c[4]); });
    var ltp = closes[closes.length - 1];
    var sma20 = _psSma(closes, 20);
    var sma50 = _psSma(closes, Math.min(50, closes.length));

    // ── Trend structure ─────────────────────────────────────────────────────
    var trendScore = 0, trendLabel = 'SIDEWAYS';
    if (sma20 != null && sma50 != null) {
        if (ltp > sma20 && sma20 > sma50) { trendScore = 1; trendLabel = 'UPTREND'; }
        else if (ltp < sma20 && sma20 < sma50) { trendScore = -1; trendLabel = 'DOWNTREND'; }
    }

    // ── 20-day breakout / breakdown ──────────────────────────────────────────
    var last20 = candles.slice(-21, -1); // excludes today, so today can "break" it
    var high20 = Math.max.apply(null, last20.map(function (c) { return parseFloat(c[2]); }));
    var low20 = Math.min.apply(null, last20.map(function (c) { return parseFloat(c[3]); }));
    var breakoutScore = 0, breakoutLabel = 'INSIDE RANGE';
    if (ltp >= high20) { breakoutScore = 1; breakoutLabel = 'BREAKOUT (20d high)'; }
    else if (ltp <= low20) { breakoutScore = -1; breakoutLabel = 'BREAKDOWN (20d low)'; }

    // ── Relative strength vs NIFTY 50 over the same 20-day window ───────────
    var pctChg20 = closes.length > 20 ? ((ltp - closes[closes.length - 21]) / closes[closes.length - 21]) * 100 : 0;
    var relStrength = pctChg20 - (niftyPctChg20 || 0);
    var rsScore = relStrength > 2 ? 1 : relStrength < -2 ? -1 : 0;

    // ── Multi-day futures OI buildup (classic price/OI quadrant, on daily data) ─
    // "NO DATA" used to be one label for three different causes (no futures token
    // resolved at all, the fetch coming back empty, or genuinely too few candles yet —
    // e.g. a contract that just rolled over). Split so it's actually diagnosable instead
    // of a dead end.
    // Rollover week: near-month OI structurally declines into expiry as EVERY stock's
    // positions roll to the next month, independent of actual conviction — that swamps the
    // 5-day OI comparison and makes almost everything read as OI-down (SHORT COVERING /
    // LONG UNWINDING only, never a genuine buildup). Neutralize instead of reporting a
    // misleading directional read once inside that window. 3 trading days ≈ Wed onward of
    // expiry week for a Thursday/last-Thursday expiry — matches when rollover volume
    // typically dominates fresh positioning.
    var ROLLOVER_WINDOW_DAYS = 3;
    var inRollover = daysToExpiry != null && daysToExpiry >= 0 && daysToExpiry <= ROLLOVER_WINDOW_DAYS;

    var oiScore = 0, oiLabel;
    if (!futToken) oiLabel = 'NO FUT TOKEN';
    else if (inRollover) oiLabel = 'ROLLOVER (' + daysToExpiry + 'd to expiry)';
    else if (!futCandles || !futCandles.length) oiLabel = 'FETCH EMPTY';
    else if (futCandles.length < 6) oiLabel = 'TOO FEW CANDLES (' + futCandles.length + ')';
    else oiLabel = 'NO DATA';
    if (!inRollover && futCandles && futCandles.length >= 6) {
        var oiNow = parseFloat(futCandles[futCandles.length - 1][6]) || 0;
        var oiPrev = parseFloat(futCandles[futCandles.length - 6][6]) || 0; // ~5 trading days back
        var priceNow = parseFloat(futCandles[futCandles.length - 1][4]);
        var pricePrev = parseFloat(futCandles[futCandles.length - 6][4]);
        var oiUp = oiNow > oiPrev * 1.02, oiDown = oiNow < oiPrev * 0.98;
        var priceUp = priceNow > pricePrev, priceDown = priceNow < pricePrev;
        if (oiUp && priceUp) { oiScore = 1; oiLabel = 'LONG BUILDUP'; }
        else if (oiUp && priceDown) { oiScore = -1; oiLabel = 'SHORT BUILDUP'; }
        else if (oiDown && priceUp) { oiScore = 0.5; oiLabel = 'SHORT COVERING'; }
        else if (oiDown && priceDown) { oiScore = -0.5; oiLabel = 'LONG UNWINDING'; }
        else { oiLabel = 'FLAT OI'; }
    }

    // ── Composite ─────────────────────────────────────────────────────────────
    var total = trendScore * 2 + breakoutScore * 1.5 + rsScore * 1 + oiScore * 1.5;
    var verdict = 'WATCH', verdictColor = 'var(--gtb-amber)';
    if (total >= 3) { verdict = 'STRONG BUY'; verdictColor = 'var(--gtb-green)'; }
    else if (total >= 1.5) { verdict = 'BUY'; verdictColor = 'var(--gtb-green)'; }
    else if (total <= -3) { verdict = 'STRONG SELL'; verdictColor = 'var(--gtb-red)'; }
    else if (total <= -1.5) { verdict = 'SELL'; verdictColor = 'var(--gtb-red)'; }

    var setup = {
        ltp: ltp, pctChg20: pctChg20, sma20: sma20, sma50: sma50, high20: high20, low20: low20,
        trendScore: trendScore, trendLabel: trendLabel,
        breakoutScore: breakoutScore, breakoutLabel: breakoutLabel,
        relStrength: relStrength, oiScore: oiScore, oiLabel: oiLabel,
        total: total, verdict: verdict, verdictColor: verdictColor,
    };
    _psAttachTradePlan(setup);
    return setup;
}

// ── Trade plan (entry / target / stop / exit) — derived from the SAME daily levels the
// score already computed (SMA20, 20-day high/low), not a new data source. This is a
// starting structural plan (a measured-move target off the 20-day range, a structural
// stop at SMA20/the opposite side of that range), not a guarantee — same caveat as the
// score itself: it's a lean, not a certainty, and should be sized/adjusted with your own
// risk rules.
function _psAttachTradePlan(setup) {
    var range20 = setup.high20 - setup.low20;
    var isBuy = setup.verdict === 'BUY' || setup.verdict === 'STRONG BUY';
    var isSell = setup.verdict === 'SELL' || setup.verdict === 'STRONG SELL';

    if (isBuy) {
        setup.entry = setup.ltp;
        setup.target = setup.ltp + range20 * 0.75; // 75% of the 20d range projected forward
        // "Whichever is hit first" as price falls means the CLOSER level to entry, i.e. the
        // HIGHER of the two (Math.max) — using Math.min here would pick the further/wider
        // level, contradicting both this comment and the exit-criteria text below.
        setup.stop = Math.max(setup.sma20 != null ? setup.sma20 : setup.low20, setup.low20);
        setup.exitCriteria = 'Exit on a daily close below SMA20 (' + (setup.sma20 != null ? setup.sma20.toFixed(1) : '—')
            + ') or below the 20d low (' + setup.low20.toFixed(1) + ') — whichever is hit first. '
            + 'Also exit if the futures OI reading flips to LONG UNWINDING/SHORT BUILDUP on a later scan.';
    } else if (isSell) {
        setup.entry = setup.ltp;
        setup.target = setup.ltp - range20 * 0.75;
        // Same fix mirrored for shorts: the closer level as price rises is the LOWER of the
        // two (Math.min), not the further one.
        setup.stop = Math.min(setup.sma20 != null ? setup.sma20 : setup.high20, setup.high20);
        setup.exitCriteria = 'Exit on a daily close above SMA20 (' + (setup.sma20 != null ? setup.sma20.toFixed(1) : '—')
            + ') or above the 20d high (' + setup.high20.toFixed(1) + ') — whichever is hit first. '
            + 'Also exit if the futures OI reading flips to SHORT COVERING/LONG BUILDUP on a later scan.';
    } else {
        setup.entry = null; setup.target = null; setup.stop = null;
        setup.exitCriteria = 'No trade — WATCH means trend/breakout/OI aren\'t aligned yet. Wait for the verdict to move to BUY/SELL before entering.';
    }

    if (setup.entry != null && setup.stop != null) {
        setup.riskReward = Math.abs(setup.target - setup.entry) / Math.max(0.01, Math.abs(setup.entry - setup.stop));
    } else {
        setup.riskReward = null;
    }
}

// ── Scan orchestration ───────────────────────────────────────────────────────
var _PS_SCANNING = false;

jQ(document).on('click', '#ps-scan-btn', async function () {
    if (_PS_SCANNING) return;
    _PS_SCANNING = true;
    var $btn = jQ(this).prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Scanning…');
    _PS_CACHE = {};

    try {
        var universe = jQ('#ps-chip-panel .sv-chip.sv-chip-selected').map(function () { return jQ(this).attr('data-name'); }).get();
        if (!universe.length) { _gtbToast('Pick a filter above (or add symbols by search) before scanning.', 'error'); return; }

        // NIFTY 50's own 20-day % change, fetched once, shared as the relative-strength baseline.
        var niftyToken = (typeof INSTRUMENT_TOKENS !== 'undefined') ? INSTRUMENT_TOKENS['NIFTY 50'] : null;
        var niftyPctChg20 = 0;
        if (niftyToken) {
            try {
                var niftyCandles = await _psFetchDaily(niftyToken, 70);
                if (niftyCandles.length > 20) {
                    var nc = niftyCandles.map(function (c) { return parseFloat(c[4]); });
                    niftyPctChg20 = ((nc[nc.length - 1] - nc[nc.length - 21]) / nc[nc.length - 21]) * 100;
                }
            } catch (e) {}
        }

        var done = 0;
        for (var i = 0; i < universe.length; i++) {
            var name = universe[i];
            jQ('#ps-progress').text('Scanning ' + (i + 1) + ' / ' + universe.length + ' — ' + name);
            try {
                var token = _psPriceTokenFor(name);
                if (!token) continue;
                var candles = await _psFetchDaily(token, 70);
                var futEntry = _psFutEntryFor(name);
                var futToken = futEntry ? futEntry.instrument_token : null;
                var daysToExpiry = futEntry ? _psDaysToExpiry(futEntry.expiry) : null;
                var futCandles = futToken ? await _psFetchDaily(futToken, 15) : null;
                if (!futToken) console.log('[positional-screener]', name, 'no futures token resolved (check FUTURE_INTRUMENT_LIST/COMMODITIES_FUTURE_INSTRUMENT_LIST)');
                else if (daysToExpiry != null && daysToExpiry <= 3) console.log('[positional-screener]', name, 'in rollover window —', daysToExpiry, 'days to expiry, OI buildup read suppressed');
                else if (!futCandles || futCandles.length < 6) console.log('[positional-screener]', name, 'futures token', futToken, 'returned', (futCandles || []).length, 'candles');
                var setup = _psComputeSetup(candles, futCandles, niftyPctChg20, futToken, daysToExpiry);
                if (setup) { setup.name = name; _PS_CACHE[name] = setup; done++; }
            } catch (e) { console.log('[positional-screener]', name, e); }
            if (i % 10 === 0) _psRenderTable(); // incremental render so results appear while scanning
        }
        _psRenderTable();
        jQ('#ps-progress').text('Done — ' + done + ' / ' + universe.length + ' scanned');
        _gtbToast('Positional scan complete (' + done + ' stocks)', 'success');
    } finally {
        _PS_SCANNING = false;
        $btn.prop('disabled', false);
        _psUpdateScanCount();
    }
});

// ── Top Picks strip — always ranks the FULL scanned universe (_PS_CACHE), independent
// of whatever filter/sort/search is currently applied to the table below, so it stays a
// stable "best of this scan" reference rather than shifting with the table's own view.
function _psTopPicksHtml() {
    var all = Object.values(_PS_CACHE);
    if (!all.length) return '';
    var buys = all.filter(function (r) { return r.verdict.indexOf('BUY') !== -1; })
        .sort(function (a, b) { return b.total - a.total; }).slice(0, 5);
    var sells = all.filter(function (r) { return r.verdict.indexOf('SELL') !== -1; })
        .sort(function (a, b) { return a.total - b.total; }).slice(0, 5);
    if (!buys.length && !sells.length) return '';

    function _chip(r) {
        var kiteLink = _psChartLink(r.name, _psPriceTokenFor(r.name));
        return '<a href="' + kiteLink + '" target="_blank" rel="noopener" class="ps-pick-chip" style="border-color:' + r.verdictColor + ';color:' + r.verdictColor + ';" title="' + r.verdict + ' — score ' + r.total.toFixed(1) + '">'
            + r.name + ' <span class="ps-pick-score">' + (r.total >= 0 ? '+' : '') + r.total.toFixed(1) + '</span></a>';
    }

    var html = '<div class="ps-top-picks">';
    if (buys.length) html += '<div class="ps-top-picks-row"><span class="ps-top-picks-label" style="color:var(--gtb-green);">TOP BUY</span>' + buys.map(_chip).join('') + '</div>';
    if (sells.length) html += '<div class="ps-top-picks-row"><span class="ps-top-picks-label" style="color:var(--gtb-red);">TOP SELL</span>' + sells.map(_chip).join('') + '</div>';
    html += '</div>';
    return html;
}

// Total BUY/SELL/WATCH counts across the full scanned set (_PS_CACHE) — independent of
// whatever filter/sort/search is applied to the table below, same convention as the Top
// Picks strip, so it always reads "how many across the whole scan," not "how many shown."
function _psRenderSummary() {
    var all = Object.values(_PS_CACHE);
    if (!all.length) { jQ('#ps-summary').empty(); return; }
    var buy = all.filter(function (r) { return r.verdict === 'BUY' || r.verdict === 'STRONG BUY'; }).length;
    var sell = all.filter(function (r) { return r.verdict === 'SELL' || r.verdict === 'STRONG SELL'; }).length;
    var watch = all.length - buy - sell;
    jQ('#ps-summary').html(
        '<span class="ps-summary-buy">' + buy + ' BUY</span>'
        + '<span class="ps-summary-sell">' + sell + ' SELL</span>'
        + '<span class="ps-summary-watch">' + watch + ' WATCH</span>'
        + '<span class="ps-summary-total">(' + all.length + ' scanned)</span>'
    );
}

// ── Render ────────────────────────────────────────────────────────────────────
function _psRenderTable() {
    _psRenderSummary();
    var rows = Object.values(_PS_CACHE);
    var filter = jQ('#ps-filter').val() || 'all';
    var sort = jQ('#ps-sort').val() || 'score';
    var q = (jQ('#ps-search').val() || '').trim().toUpperCase();

    if (filter === 'buy') rows = rows.filter(function (r) { return r.verdict === 'BUY' || r.verdict === 'STRONG BUY'; });
    else if (filter === 'sell') rows = rows.filter(function (r) { return r.verdict === 'SELL' || r.verdict === 'STRONG SELL'; });
    else if (filter === 'watch') rows = rows.filter(function (r) { return r.verdict === 'WATCH'; });
    if (q) rows = rows.filter(function (r) { return r.name.indexOf(q) !== -1; });

    if (sort === 'name') rows.sort(function (a, b) { return a.name < b.name ? -1 : 1; });
    else if (sort === 'rs') rows.sort(function (a, b) { return b.relStrength - a.relStrength; });
    else rows.sort(function (a, b) { return b.total - a.total; });

    if (!rows.length) {
        jQ('#ps-table-wrap').html('<div class="sv-empty-state"><i class="bi bi-search"></i><span>No results' + (q ? ' for "' + q + '"' : '') + '.</span></div>');
        return;
    }

    var _iiSafe = typeof _ii === 'function' ? _ii : function () { return ''; };
    var html = _psTopPicksHtml() + '<table class="ps-table">'
        + '<thead><tr>'
        + '<th>Symbol</th><th>LTP</th><th>20d Chg%</th><th>Trend</th><th>Breakout</th>'
        + '<th>Rel. Strength</th><th>Futures OI (5d)' + _iiSafe('ps-signals') + '</th><th>Score</th><th>Verdict</th>'
        + '<th>Entry</th><th>Target</th><th>Stop</th><th>R:R' + _iiSafe('ps-tradeplan') + '</th><th></th><th></th>'
        + '</tr></thead><tbody>'
        + rows.map(function (r) {
            var kiteLink = _psChartLink(r.name, _psPriceTokenFor(r.name));
            var chgColor = r.pctChg20 >= 0 ? 'var(--gtb-green)' : 'var(--gtb-red)';
            var trendColor = r.trendScore > 0 ? 'var(--gtb-green)' : r.trendScore < 0 ? 'var(--gtb-red)' : 'var(--gtb-muted)';
            var breakoutColor = r.breakoutScore > 0 ? 'var(--gtb-green)' : r.breakoutScore < 0 ? 'var(--gtb-red)' : 'var(--gtb-muted)';
            var rsColor = r.relStrength > 0 ? 'var(--gtb-green)' : r.relStrength < 0 ? 'var(--gtb-red)' : 'var(--gtb-muted)';
            var oiColor = r.oiScore > 0 ? 'var(--gtb-green)' : r.oiScore < 0 ? 'var(--gtb-red)' : 'var(--gtb-muted)';
            var rowTint = r.verdict.indexOf('BUY') !== -1 ? 'rgba(63,185,80,0.06)' : r.verdict.indexOf('SELL') !== -1 ? 'rgba(248,81,73,0.06)' : 'transparent';
            var hasPlan = r.entry != null;
            return '<tr style="background:' + rowTint + ';">'
                + '<td class="ps-cell-strong">' + r.name + '</td>'
                + '<td>' + r.ltp.toFixed(1) + '</td>'
                + '<td style="color:' + chgColor + ';">' + (r.pctChg20 >= 0 ? '+' : '') + r.pctChg20.toFixed(1) + '%</td>'
                + '<td style="color:' + trendColor + ';">' + r.trendLabel + '</td>'
                + '<td style="color:' + breakoutColor + ';">' + r.breakoutLabel + '</td>'
                + '<td style="color:' + rsColor + ';">' + (r.relStrength >= 0 ? '+' : '') + r.relStrength.toFixed(1) + '%</td>'
                + '<td style="color:' + oiColor + ';">' + r.oiLabel + '</td>'
                + '<td class="ps-cell-strong">' + r.total.toFixed(1) + '</td>'
                + '<td><span class="ps-verdict" style="color:' + r.verdictColor + ';border-color:' + r.verdictColor + ';">' + r.verdict + '</span></td>'
                + '<td>' + (hasPlan ? r.entry.toFixed(1) : '—') + '</td>'
                + '<td style="color:var(--gtb-green);">' + (hasPlan ? r.target.toFixed(1) : '—') + '</td>'
                + '<td style="color:var(--gtb-red);">' + (hasPlan ? r.stop.toFixed(1) : '—') + '</td>'
                + '<td>' + (r.riskReward != null ? '1:' + r.riskReward.toFixed(1) : '—') + '</td>'
                + '<td><i class="bi bi-info-circle ps-exit-icon" title="' + r.exitCriteria.replace(/"/g, '&quot;') + '"></i></td>'
                + '<td><a href="' + kiteLink + '" target="_blank" rel="noopener" class="oss-chart-link" title="Open chart"><i class="bi bi-graph-up"></i></a></td>'
                + '</tr>';
        }).join('')
        + '</tbody></table>';
    jQ('#ps-table-wrap').html(html);
}
jQ(document).on('change', '#ps-filter, #ps-sort', _psRenderTable);
jQ(document).on('input', '#ps-search', _psRenderTable);
