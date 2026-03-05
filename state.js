function createState() {
  return {
    openedCount: 0,
    totalLaunched: 0,
    closedCount: 0,
    failedCount: 0,
    skippedCount: 0,
    consecutiveFailures: 0,
    proxyIndex: 0,
    windowList: [],
    skippedProxyList: [],
    isWaitingForClose: false,
    isOpeningWindow: false,
    openNextImmediately: false,
    lastOpenTime: 0,
    allProxiesFailedLastCycle: false,
  };
}

module.exports = { createState };
