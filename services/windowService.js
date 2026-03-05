const DIRECT_LABEL = '(direct)';

function handleWindowClose(windowId, context, state, config, logger) {
  const window = state.windowList.find((w) => w.id === windowId);
  if (!window || window.status !== 'open') return;
  window.status = 'closed';
  state.openedCount--;
  state.closedCount++;
  logger.close(`window ${windowId} closed | open: ${state.openedCount}/${config.maxOpenWindows}`);
  try { context.close(); } catch (_) {}
  // No loop: do not reopen or trigger another window
}

async function acceptCookies(page, config) {
  try {
    const btn = await page.waitForSelector(config.cookieBannerSelector || '#onetrust-accept-btn-handler', {
      timeout: config.cookieBannerTimeoutMs || 10000,
    });
    if (btn) await btn.click();
  } catch (_) {}
}

function getGridBounds(windowIndex, config) {
  if (config.maxOpenWindows === 1) {
    return { left: 0, top: 0, width: config.windowWidth, height: config.windowHeight };
  }
  const { gridCols, gridCellWidth, gridCellHeight } = config;
  const col = windowIndex % gridCols;
  const row = Math.floor(windowIndex / gridCols);
  return {
    left: col * gridCellWidth,
    top: row * gridCellHeight,
    width: gridCellWidth,
    height: gridCellHeight,
  };
}

async function openWindowWithContext(browser, proxyUrl, username, password, windowId, logLabel, config, state, logger, proxyService) {
  const context = await browser.newContext(
    proxyService.buildContextOptions(proxyUrl, username, password, config)
  );
  const page = await context.newPage();

  const windowIndex = state.totalLaunched;
  const bounds = getGridBounds(windowIndex, config);

  if (config.browserType === 'chromium') {
    try {
      const cdpSession = await context.newCDPSession(page);
      await cdpSession.send('Browser.setWindowBounds', {
        windowId: 1,
        bounds: { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height },
      });
    } catch (_) {}
  }

  await page.goto(config.targetUrl, {
    timeout: config.proxyTimeoutMs,
    waitUntil: 'domcontentloaded',
  });

  await acceptCookies(page, config);

  if (!config.userDataDir) {
    const { injectUserscript } = require('./userscriptInjector');
    try {
      await injectUserscript(page, config, logger);
    } catch (err) {
      logger.warn(`userscript injection failed: ${err.message}`);
    }
  }

  state.openedCount++;
  state.totalLaunched++;
  state.windowList.push({ id: windowId, proxyUrl: logLabel, status: 'open', context, page });
  state.lastOpenTime = Date.now();
  state.allProxiesFailedLastCycle = false;

  logger.open(`window ${windowId} → ${logLabel} | grid ${windowIndex + 1} | ${bounds.width}x${bounds.height} @ (${bounds.left},${bounds.top}) | open: ${state.openedCount}/${config.maxOpenWindows}`);

  const boundClose = () => handleWindowClose(windowId, context, state, config, logger);
  page.on('close', boundClose);
  context.on('close', boundClose);
}

async function openNewWindow(browser, config, state, proxyList, logger, proxyService) {
  if (state.isOpeningWindow) return;
  state.isOpeningWindow = true;

  let windowOpened = false;
  const windowId = state.totalLaunched + 1;

  // No proxy test — open one window directly

  if (!config.useProxy) {
    try {
      await openWindowWithContext(browser, null, null, null, windowId, DIRECT_LABEL, config, state, logger, proxyService);
      windowOpened = true;
    } catch (err) {
      logger.error(`window failed (direct): ${err.message}`);
    }
    state.isOpeningWindow = false;
    return;
  }

  const proxyData = proxyList[state.proxyIndex % proxyList.length];
  state.proxyIndex++;
  const { server, port, username, password } = proxyData;
  const proxyUrl = `http://${server}:${port}`;

  try {
    logger.proxy(`opening window → ${proxyUrl}`);
    await openWindowWithContext(browser, proxyUrl, username, password, windowId, proxyUrl, config, state, logger, proxyService);
    windowOpened = true;
  } catch (err) {
    logger.error(`window failed → ${proxyUrl} | ${err.message}`);
  }

  state.isOpeningWindow = false;
}

module.exports = { handleWindowClose, openWindowWithContext, openNewWindow, acceptCookies };
