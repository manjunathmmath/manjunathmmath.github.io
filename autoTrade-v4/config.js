window.jQ = jQuery.noConflict(true);
const g_config = new MonkeyConfig({
    title: 'Market Trend Settings',
    menuCommand: true,
    onSave: reloadPage,
    params: {
        previous_day_date: {
            type: 'text',
            default: moment().subtract(1, "days").format("YYYY-MM-DD")
        },
        current_day_date: {
            type: 'text',
            default: moment().format("YYYY-MM-DD")
        },
        nifty_expiry_date: {
            type: 'text',
            default: moment().format("YYYY-MM-DD")
        },
        sensex_expiry_date: {
            type: 'text',
            default: moment().format("YYYY-MM-DD")
        },
        margin: {
            type: 'text',
            default: 10000
        },
        refresh_time: {
            type: 'text',
            default: 60
        },
        historical_data_interval: {
            type: 'text',
            default: '3minute'
        },
        enable_sound: {
            type: 'checkbox',
            default: false
        },
        show_volume_on_chart: {
            type: 'checkbox',
            default: false
        },
        use_ltp_for_strike: {
            type: 'checkbox',
            default: true
        },
        mcx_previous_day_date: {
            type: 'text',
            default: moment().subtract(1, "days").format("YYYY-MM-DD")
        },
        mcx_current_day_date: {
            type: 'text',
            default: moment().format("YYYY-MM-DD")
        },
        OVX: {
            type: 'text',
            default: 68.90 //https://in.investing.com/indices/cboe-crude-oil-volatility-historical-data
        },
        VXSLV: {
            type: 'text',
            default: 27.95 //https://in.investing.com/indices/cboe-silver-etf-volatility
        },
        GVZ: {
            type: 'text',
            default: 16.45 //https://www.investing.com/indices/cboe-gold-volatitity
        },
        VIX: {
            type: 'text',
            default: 21.44 //https://in.investing.com/indices/volatility-s-p-500
        },
        api_key: {
            'label': 'API Key',
            'type': 'text',
            'default': 'yxwoymcn7nnv91l6',
        },
        api_secret: {
            'label': 'API Secret',
            'type': 'text',
            'default': 'hna7avvcp0as89u4oo5vtioryv6syfwo',
        },
        api_access_token: {
            'label': 'Access Token',
            'type': 'text',
            'default': '',
        },
        hedge_diff_nifty: {
            'label': 'Hedge strike diff — NIFTY (points)',
            'type': 'text',
            'default': 500,
        },
        hedge_diff_banknifty: {
            'label': 'Hedge strike diff — BANK NIFTY (points)',
            'type': 'text',
            'default': 500,
        },
        hedge_diff_stocks: {
            'label': 'Hedge strike diff — Stocks (points)',
            'type': 'text',
            'default': 50,
        },
    },

});

const VERSION = "v1.0";
const BASE_URL = "https://kite.zerodha.com";
const PREVIOUS_DAY = g_config.get('previous_day_date');
const CURRENT_DAY = g_config.get('current_day_date');

const CURRENT_DATE_FROM_DATE = CURRENT_DAY + " 09:15:00";
const CURRENT_DATE_TO_DATE = CURRENT_DAY + " 11:05:00";

let date = new Date().toJSON().slice(0, 10);
const MARGIN = g_config.get('margin');
let weightIndex = []
const HISTORICAL_DATA_INTERVAL = g_config.get('historical_data_interval');
const SHOW_VOLUME_ON_CHART = g_config.get('show_volume_on_chart');
const REFRESH_TIME = g_config.get('refresh_time');
const NIFTY_EXPIRY_DATE = g_config.get("nifty_expiry_date")
const ENABLE_SOUND = g_config.get('enable_sound');
const SENSEX_EXPIRY_DATE = g_config.get('sensex_expiry_date');
const USE_LTP_FOR_STRIKE = g_config.get('use_ltp_for_strike');
let OPTION_STRIKE_LIST = NSE_OPTION_STRIKE_LIST

const MCX_PREVIOUS_DAY = g_config.get('mcx_previous_day_date');
const MCX_CURRENT_DAY = g_config.get('mcx_current_day_date');
const OVX = g_config.get('OVX'); //CRUDE vix
const VXSLV = g_config.get("VXSLV") //SILVER VIX
const GVZ = g_config.get("GVZ") //GOLD VIX
const VIX = g_config.get("VIX") //CBOE Volatility Index

// Hedge strike distance (in points) — how far OTM to place the hedge leg's CE/PE strike
// relative to the underlying's own ATM strike. Configurable per instrument class since a
// stock's ATM±diff needs to be much tighter than NIFTY/BANK NIFTY's. Used by the Option
// Strike Search popup (optionStrikeSearch.js).
const HEDGE_DIFF_NIFTY = parseFloat(g_config.get('hedge_diff_nifty')) || 500;
const HEDGE_DIFF_BANKNIFTY = parseFloat(g_config.get('hedge_diff_banknifty')) || 500;
const HEDGE_DIFF_STOCKS = parseFloat(g_config.get('hedge_diff_stocks')) || 50;