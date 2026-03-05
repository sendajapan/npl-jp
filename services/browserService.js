const path = require('path');
const playwright = require('playwright');

async function launch(config) {
  const browserName = config.browserType || 'chromium';
  const launchOptions = { headless: false };

  if (config.userDataDir) {
    launchOptions.userDataDir = path.isAbsolute(config.userDataDir)
      ? config.userDataDir
      : path.resolve(process.cwd(), config.userDataDir);
    if (config.useChrome) {
      launchOptions.channel = 'chrome';
    }
  }

  if (browserName === 'chromium') {
    launchOptions.args = [
      `--window-size=${config.windowWidth},${config.windowHeight}`,
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ];
  }
  return playwright[browserName].launch(launchOptions);
}

async function mainLoop(browser, config, state, proxyList, logger, windowService, proxyService) {
  const timeSinceLastOpen = Date.now() - state.lastOpenTime;
  const openInterval = state.allProxiesFailedLastCycle ? config.proxyRetryBackoffMs : config.openIntervalMs;

  if (state.openedCount >= config.maxOpenWindows) {
    if (!state.isWaitingForClose) {
      state.isWaitingForClose = true;
      logger.status(`max windows reached (${config.maxOpenWindows}) — waiting for a window to close`);
      logger.printSummary();
    }
    return;
  }

  const shouldOpen = state.openNextImmediately || timeSinceLastOpen >= openInterval;
  if (shouldOpen) {
    state.openNextImmediately = false;
    await windowService.openNewWindow(browser, config, state, proxyList, logger, proxyService);
  }
}

function printStartupBanner(screen, config, proxyList) {
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
  console.log(`  browser          : ${config.browserType || 'chromium'}`);
  console.log(`  use proxy        : ${config.useProxy}`);
  console.log(`  no-proxy fallback : ${config.useProxy && config.useNoProxyFallback ? 'yes' : 'no'}`);
  console.log(`  total proxies    : ${config.useProxy ? proxyList.length : 0}${config.singleProxyFromList && config.useProxy ? ' (single proxy from list)' : config.useProxy ? ' (cycling infinitely)' : ' (direct only)'}`);
  console.log('============================================================');
  console.log('');
}

async function start(config, state, proxyList, logger) {
  const windowService = require('./windowService');
  const proxyService = require('./proxyService');
  const browser = await launch(config);

  // Open one window once — no loop
  await mainLoop(browser, config, state, proxyList, logger, windowService, proxyService);

  // When the single window closes, exit (no reopening)
  const exitCheck = setInterval(() => {
    if (state.openedCount === 0) {
      clearInterval(exitCheck);
      logger.status('window closed — exiting');
      browser.close().then(() => process.exit(0));
    }
  }, 500);

  process.on('SIGINT', async () => {
    clearInterval(exitCheck);
    logger.status('script interrupted — shutting down');
    await browser.close();
    process.exit(0);
  });
}

module.exports = { launch, mainLoop, start, printStartupBanner };
