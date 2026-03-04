const { chromium } = require('playwright');
const { execSync } = require('child_process');

// ============================================================
// SCREEN SIZE DETECTION
// ============================================================
function getScreenSize() {
  try {
    let width, height;

    if (process.platform === 'win32') {
      const output = execSync(
        'powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width; [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height"',
        { encoding: 'utf8' }
      ).trim().split('\n');
      width  = parseInt(output[0]);
      height = parseInt(output[1]);

    } else if (process.platform === 'darwin') {
      const output = execSync(
        `osascript -e 'tell application "Finder" to get bounds of window of desktop'`,
        { encoding: 'utf8' }
      ).trim();
      const parts = output.split(', ');
      width  = parseInt(parts[2]);
      height = parseInt(parts[3]);

    } else {
      const output = execSync(`xdpyinfo | grep dimensions`, { encoding: 'utf8' });
      const match  = output.match(/(\d+)x(\d+)/);
      width  = parseInt(match[1]);
      height = parseInt(match[2]);
    }

    return { width, height };

  } catch (err) {
    console.warn('[WARN] Could not detect screen size. Using fallback 1920x1080.');
    return { width: 1920, height: 1080 };
  }
}

// ============================================================
// CONFIGURATION
// ============================================================
const screen = getScreenSize();

const config = {
  targetUrl          : 'https://visa.vfsglobal.com/npl/en/jpn/login/',
  proxyTestUrl       : 'https://visa.vfsglobal.com/npl/en/jpn/login/',  // test against real target
  maxOpenWindows     : 2,
  openIntervalMs     : 5000,
  checkIntervalMs    : 1000,
  proxyTimeoutMs     : 30000,   // increased to 30s for vfsglobal
  maxSkipRetries     : 3,
  windowWidth        : Math.floor(screen.width  * 0.33),
  windowHeight       : Math.floor(screen.height * 0.33),
};

// ============================================================
// PROXY LIST
// ============================================================
const proxyList = [
  { server: 'gw.dataimpulse.com', port: '10001', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10002', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10003', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10004', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10005', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10006', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10007', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10008', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10009', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10010', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10011', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10012', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10013', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10014', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10015', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10016', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10017', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10018', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10019', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10020', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10021', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10022', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10023', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10024', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10025', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10026', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10027', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10028', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10029', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10030', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10031', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10032', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10033', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10034', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10035', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10036', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10037', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10038', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10039', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10040', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10041', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10042', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10043', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10044', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10045', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10046', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10047', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10048', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
  { server: 'gw.dataimpulse.com', port: '10049', username: '0c7c66a3b249d15a19c1__cr.jp', password: 'addf04193eb79b0b' },
];

// ============================================================
// STATE
// ============================================================
const state = {
  openedCount          : 0,
  totalLaunched        : 0,
  closedCount          : 0,
  failedCount          : 0,
  skippedCount         : 0,
  consecutiveFailures  : 0,
  proxyIndex           : 0,
  windowList           : [],
  skippedProxyList     : [],
  isWaitingForClose    : false,
  isOpeningWindow      : false,
  openNextImmediately  : false,
  lastOpenTime         : 0,
};

// ============================================================
// LOGGER
// ============================================================
const logger = {
  info   : (msg) => console.log(`[INFO]  ${msg}`),
  warn   : (msg) => console.warn(`[WARN]  ${msg}`),
  error  : (msg) => console.error(`[ERROR] ${msg}`),
  status : (msg) => console.log(`[STATE] ${msg}`),
  skip   : (msg) => console.log(`[SKIP]  ${msg}`),
  open   : (msg) => console.log(`[OPEN]  ${msg}`),
  close  : (msg) => console.log(`[CLOSE] ${msg}`),
  proxy  : (msg) => console.log(`[PROXY] ${msg}`),

  printSummary() {
    console.log('');
    console.log('============================================================');
    console.log('WINDOW TRACKER SUMMARY');
    console.log('============================================================');
    console.log(`  currently open   : ${state.openedCount}`);
    console.log(`  total launched   : ${state.totalLaunched}`);
    console.log(`  total closed     : ${state.closedCount}`);
    console.log(`  total failed     : ${state.failedCount}`);
    console.log(`  total skipped    : ${state.skippedCount}`);
    console.log(`  proxy index      : ${state.proxyIndex}`);
    console.log(`  window size      : ${config.windowWidth}x${config.windowHeight}`);
    console.log(`  waiting for close: ${state.isWaitingForClose ? 'yes' : 'no'}`);
    console.log('------------------------------------------------------------');
    console.log('  id    | status   | proxy');
    console.log('  ------|----------|------------------------------');
    state.windowList.slice(-10).forEach(w => {
      const id     = String(w.id).padEnd(6);
      const status = w.status.padEnd(8);
      console.log(`  ${id}| ${status}| ${w.proxyUrl}`);
    });
    if (state.skippedProxyList.length > 0) {
      console.log('------------------------------------------------------------');
      console.log('  skipped proxies:');
      state.skippedProxyList.forEach(p => console.log(`    - ${p}`));
    }
    console.log('============================================================');
    console.log('');
  }
};

// ============================================================
// BROWSER CONTEXT OPTIONS — anti-bot headers for vfsglobal
// ============================================================
function buildContextOptions(proxyUrl, username, password) {
  return {
    proxy: {
      server  : proxyUrl,
      username,
      password,
    },
    viewport: {
      width : config.windowWidth,
      height: config.windowHeight,
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale          : 'en-US',
    timezoneId      : 'Asia/Tokyo',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept'         : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
  };
}

// ============================================================
// PROXY TESTER — tests directly against target URL
// ============================================================
async function testProxyConnection(browser, proxyUrl, username, password) {
  let testContext = null;

  try {
    testContext = await browser.newContext(
      buildContextOptions(proxyUrl, username, password)
    );

    const testPage = await testContext.newPage();

    const response = await testPage.goto(config.proxyTestUrl, {
      timeout   : config.proxyTimeoutMs,
      waitUntil : 'domcontentloaded',
    });

    await testContext.close();

    // Accept any non-error HTTP status — 200, 301, 302, 403 all mean proxy connected
    if (response && response.status() < 500) {
      return { success: true };
    }

    return { success: false, reason: `HTTP ${response ? response.status() : 'no response'}` };

  } catch (err) {
    if (testContext) {
      try { await testContext.close(); } catch (_) {}
    }
    return { success: false, reason: err.message };
  }
}

// ============================================================
// WINDOW CLOSE HANDLER
// ============================================================
function handleWindowClose(windowId, context) {
  const window = state.windowList.find(w => w.id === windowId);

  if (!window || window.status !== 'open') return;

  window.status = 'closed';
  state.openedCount--;
  state.closedCount++;

  logger.close(`window ${windowId} closed | open: ${state.openedCount}/${config.maxOpenWindows}`);

  try { context.close(); } catch (_) {}

  if (state.isWaitingForClose) {
    state.isWaitingForClose  = false;
    state.openNextImmediately = true;
    logger.status('slot freed — opening next window on next tick');
  }

  state.lastOpenTime        = 0;
  state.openNextImmediately = true;
}

// ============================================================
// OPEN NEW WINDOW
// ============================================================
let browser;

async function openNewWindow() {
  if (state.isOpeningWindow) return;
  state.isOpeningWindow = true;

  let windowOpened  = false;
  let attempts      = 0;
  const maxAttempts = proxyList.length;

  while (!windowOpened && attempts < maxAttempts) {
    attempts++;

    const proxyData  = proxyList[state.proxyIndex % proxyList.length];
    state.proxyIndex++;

    const { server, port, username, password } = proxyData;
    const proxyUrl  = `http://${server}:${port}`;
    const windowId  = state.totalLaunched + 1;

    logger.proxy(`testing → ${proxyUrl}`);

    const proxyTest = await testProxyConnection(browser, proxyUrl, username, password);

    if (!proxyTest.success) {
      state.failedCount++;
      state.skippedCount++;
      state.consecutiveFailures++;
      state.skippedProxyList.push(proxyUrl);
      state.windowList.push({ id: windowId, proxyUrl, status: 'skipped' });

      logger.skip(`proxy failed → ${proxyUrl} | reason: ${proxyTest.reason} | attempt ${attempts}/${maxAttempts}`);

      if (state.consecutiveFailures >= config.maxSkipRetries) {
        logger.warn(`${state.consecutiveFailures} consecutive proxy failures — check your proxy list`);
        state.consecutiveFailures = 0;
      }

      continue;
    }

    state.consecutiveFailures = 0;
    logger.proxy(`proxy ok → ${proxyUrl} | opening window...`);

    try {
      const context = await browser.newContext(
        buildContextOptions(proxyUrl, username, password)
      );

      const page = await context.newPage();

      // Apply CDP window sizing
      const cdpSession = await context.newCDPSession(page);
      await cdpSession.send('Browser.setWindowBounds', {
        windowId: 1,
        bounds: {
          width : config.windowWidth,
          height: config.windowHeight,
        },
      });

      await page.goto(config.targetUrl, {
        timeout   : config.proxyTimeoutMs,
        waitUntil : 'domcontentloaded',
      });

      state.openedCount++;
      state.totalLaunched++;
      state.windowList.push({ id: windowId, proxyUrl, status: 'open', context, page });

      state.lastOpenTime = Date.now();
      windowOpened       = true;

      logger.open(`window ${windowId} → ${proxyUrl} | size: ${config.windowWidth}x${config.windowHeight} | open: ${state.openedCount}/${config.maxOpenWindows}`);

      // Primary close listener
      page.on('close', () => handleWindowClose(windowId, context));

      // Fallback close listener
      context.on('close', () => handleWindowClose(windowId, context));

    } catch (err) {
      state.failedCount++;
      state.skippedCount++;
      state.skippedProxyList.push(proxyUrl);
      state.windowList.push({ id: windowId, proxyUrl, status: 'failed' });
      logger.error(`window failed after proxy passed → ${proxyUrl} | reason: ${err.message}`);
    }
  }

  if (!windowOpened) {
    logger.warn(`all ${maxAttempts} proxies failed in this cycle — check your proxy list`);
    state.lastOpenTime = Date.now();
  }

  state.isOpeningWindow = false;
}

// ============================================================
// MAIN LOOP
// ============================================================
async function mainLoop() {
  const timeSinceLastOpen = Date.now() - state.lastOpenTime;

  if (state.openedCount >= config.maxOpenWindows) {
    if (!state.isWaitingForClose) {
      state.isWaitingForClose = true;
      logger.status(`max windows reached (${config.maxOpenWindows}) — waiting for a window to close`);
      logger.printSummary();
    }
    return;
  }

  const shouldOpen = state.openNextImmediately || timeSinceLastOpen >= config.openIntervalMs;

  if (shouldOpen) {
    state.openNextImmediately = false;
    await openNewWindow();
  }
}

// ============================================================
// STARTUP
// ============================================================
(async () => {
  console.log('');
  console.log('============================================================');
  console.log('PLAYWRIGHT MULTI-WINDOW PROXY SCRIPT');
  console.log('============================================================');
  console.log(`  screen size      : ${screen.width}x${screen.height}`);
  console.log(`  window size      : ${config.windowWidth}x${config.windowHeight} (33% of screen)`);
  console.log(`  target url       : ${config.targetUrl}`);
  console.log(`  max windows      : ${config.maxOpenWindows}`);
  console.log(`  open interval    : ${config.openIntervalMs / 1000}s`);
  console.log(`  check interval   : ${config.checkIntervalMs / 1000}s`);
  console.log(`  proxy timeout    : ${config.proxyTimeoutMs / 1000}s`);
  console.log(`  total proxies    : ${proxyList.length} (cycling infinitely)`);
  console.log('============================================================');
  console.log('');

  browser = await chromium.launch({
    headless : false,
    args     : [
      `--window-size=${config.windowWidth},${config.windowHeight}`,
      '--disable-blink-features=AutomationControlled',  // hide automation flag
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  setInterval(async () => {
    await mainLoop();
  }, config.checkIntervalMs);

  process.on('SIGINT', async () => {
    logger.status('script interrupted — shutting down');
    logger.printSummary();
    await browser.close();
    process.exit(0);
  });
})();
