function createLogger(state, config) {
  return {
    info: (msg) => console.log(`[INFO]  ${msg}`),
    warn: (msg) => console.warn(`[WARN]  ${msg}`),
    error: (msg) => console.error(`[ERROR] ${msg}`),
    status: (msg) => console.log(`[STATE] ${msg}`),
    skip: (msg) => console.log(`[SKIP]  ${msg}`),
    open: (msg) => console.log(`[OPEN]  ${msg}`),
    close: (msg) => console.log(`[CLOSE] ${msg}`),
    proxy: (msg) => console.log(`[PROXY] ${msg}`),

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
      state.windowList.slice(-10).forEach((w) => {
        const id = String(w.id).padEnd(6);
        const status = w.status.padEnd(8);
        console.log(`  ${id}| ${status}| ${w.proxyUrl}`);
      });
      if (state.skippedProxyList.length > 0) {
        console.log('------------------------------------------------------------');
        console.log('  skipped proxies:');
        state.skippedProxyList.forEach((p) => console.log(`    - ${p}`));
      }
      console.log('============================================================');
      console.log('');
    },
  };
}

module.exports = { createLogger };
