const { getScreenSize } = require('./services/screenService');
const { getConfig } = require('./config');
const { createState } = require('./state');
const { createLogger } = require('./services/loggerService');
const { start, printStartupBanner } = require('./services/browserService');

(async () => {
  const screen = getScreenSize();
  const { config, proxyList } = getConfig(screen);
  const state = createState();
  const logger = createLogger(state, config);

  printStartupBanner(screen, config, proxyList);
  await start(config, state, proxyList, logger);
})();
