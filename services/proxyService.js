function buildContextOptions(proxyUrl, username, password, config) {
  const options = {
    viewport: { width: config.windowWidth, height: config.windowHeight },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'Asia/Tokyo',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
  };
  if (proxyUrl) {
    options.proxy = {
      server: proxyUrl.startsWith('http') ? proxyUrl : `http://${proxyUrl}`,
      username,
      password,
    };
  }
  return options;
}

async function testConnection(browser, proxyUrl, username, password, config) {
  let testContext = null;
  try {
    testContext = await browser.newContext(
      buildContextOptions(proxyUrl, username, password, config)
    );
    const testPage = await testContext.newPage();
    const response = await testPage.goto(config.proxyTestUrl, {
      timeout: config.proxyTimeoutMs,
      waitUntil: 'domcontentloaded',
    });
    await testContext.close();
    if (response && response.status() < 500) return { success: true };
    return { success: false, reason: `HTTP ${response ? response.status() : 'no response'}` };
  } catch (err) {
    if (testContext) try { await testContext.close(); } catch (_) {}
    return { success: false, reason: err.message };
  }
}

module.exports = { buildContextOptions, testConnection };
