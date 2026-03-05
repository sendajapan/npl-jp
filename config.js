const { parseProxyList } = require('./services/proxyParser');

const proxyUrlStrings = [
  '202.136.75.75:10075:ivac:ivacpass',
  '202.136.75.76:10076:ivac:ivacpass',
  '202.136.75.77:10077:ivac:ivacpass',
  '202.136.75.78:10078:ivac:ivacpass',
  '202.136.75.79:10079:ivac:ivacpass',
  '202.136.75.80:10080:ivac:ivacpass',
  '202.136.75.81:10081:ivac:ivacpass',
  '202.136.75.82:10082:ivac:ivacpass',
  '202.136.75.83:10083:ivac:ivacpass',
  '202.136.75.84:10084:ivac:ivacpass',
];

function getGridLayout(n) {
  const count = Math.min(Math.max(1, n), 8);
  const cols = count <= 1 ? 1 : count <= 2 ? 2 : count <= 4 ? 2 : count <= 6 ? 3 : 4;
  const rows = Math.ceil(count / cols);
  return { cols, rows };
}

function getConfig(screen) {
  const fullProxyList = parseProxyList(proxyUrlStrings);
  const maxGridWindows = 8;
  const gridCap = Math.min(10, maxGridWindows);
  const { cols: gridCols, rows: gridRows } = getGridLayout(gridCap);
  const gridCellWidth = Math.floor(screen.width / gridCols);
  const gridCellHeight = Math.floor(screen.height / gridRows);

  const config = {
    targetUrl: 'https://visa.vfsglobal.com/npl/en/jpn/login/',
    proxyTestUrl: 'https://visa.vfsglobal.com/npl/en/jpn/login/',
    maxOpenWindows: 1,
    openIntervalMs: 5000,
    checkIntervalMs: 1000,
    proxyTimeoutMs: 30000,
    maxSkipRetries: 3,
    screenWidth: screen.width,
    screenHeight: screen.height,
    gridCols,
    gridRows,
    gridCellWidth,
    gridCellHeight,
    windowWidth: 1280,
    windowHeight: 720,
    singleProxyFromList: true,
    useProxy: true,
    useNoProxyFallback: true,
    proxyRetryBackoffMs: 60000,
    browserType: 'chromium',
    cookieBannerSelector: '#onetrust-accept-btn-handler',
    cookieBannerTimeoutMs: 10000,
    userscriptPath: 'VFS Global Auto Login (Nepal → Japan)-4.0.user.js',
    userscriptCredentialApiUrl: 'https://senda.fit/autocraft_placeholder/api.php',
    // Persistent profile with Tampermonkey: set to a folder name (e.g. 'browser-profile').
    // First run: install Tampermonkey from Chrome Web Store and add the .user.js script.
    userDataDir: null,
    useChrome: false,
  };
  const proxyList = config.singleProxyFromList ? fullProxyList.slice(0, 1) : fullProxyList;
  return { config, proxyList };
}

module.exports = { getConfig, proxyUrlStrings };
