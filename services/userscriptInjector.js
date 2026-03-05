const path = require('path');
const fs = require('fs');

const USERSCRIPT_HEADER_END = /\/\s*==\/UserScript==\s*\n/;

/**
 * Load userscript source from disk and strip the Tampermonkey header.
 * @param {string} userscriptPath - Path to .user.js file (relative to cwd or absolute)
 * @returns {string} Script content without the ==UserScript== block
 */
function loadAndStripHeader(userscriptPath) {
  const resolved = path.isAbsolute(userscriptPath)
    ? userscriptPath
    : path.resolve(process.cwd(), userscriptPath);
  const raw = fs.readFileSync(resolved, 'utf8');
  const match = raw.match(USERSCRIPT_HEADER_END);
  const start = match ? match.index + match[0].length : 0;
  return raw.slice(start).trim();
}

/**
 * Fetch credentials from the remote API (Node context, no CORS).
 * @param {string} apiUrl
 * @returns {Promise<{ email: string, password: string } | null>}
 */
async function fetchCredentialsInNode(apiUrl) {
  try {
    const res = await fetch(apiUrl, {
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.email && data.password) return data;
    return null;
  } catch (_) {
    return null;
  }
}

/**
 * Replace fetchCredentials in the script with a version that uses
 * window.__VFS_CREDENTIALS__ (injected from Node) or GM_getValue cache.
 */
function patchFetchCredentials(scriptContent) {
  if (!scriptContent.includes('GM_xmlhttpRequest')) return scriptContent;

  const startMark = 'function fetchCredentials() {';
  const endMark = '                ontimeout: () => reject(new Error(\'API timed out.\'))\n            });\n        });\n    }';
  const start = scriptContent.indexOf(startMark);
  const end = scriptContent.indexOf(endMark, start);
  if (start === -1 || end === -1) return scriptContent;

  const patched = `function fetchCredentials() {
        if (window.__VFS_CREDENTIALS__)
            return Promise.resolve(window.__VFS_CREDENTIALS__);
        var e = GM_getValue('vfs_email', null), p = GM_getValue('vfs_password', null);
        if (e && p) return Promise.resolve({ email: e, password: p });
        return Promise.reject(new Error('No credentials available.'));
    }`;

  return scriptContent.slice(0, start) + patched + scriptContent.slice(end + endMark.length);
}

/**
 * Build bootstrap script: set credentials and polyfill GM_setValue/GM_getValue.
 * @param {{ email: string, password: string } | null} credentials
 * @returns {string}
 */
function buildBootstrap(credentials) {
  const credsJson = credentials
    ? JSON.stringify(credentials).replace(/\u2028|\u2029/g, '')
    : 'null';
  return `
(function() {
  window.__VFS_CREDENTIALS__ = ${credsJson};
  var __gmStore = {};
  window.GM_setValue = function(k, v) { __gmStore[k] = v; };
  window.GM_getValue = function(k, def) { return __gmStore[k] !== undefined ? __gmStore[k] : def; };
})();
`;
}

/**
 * Inject the VFS userscript into the page so it can interact with the site.
 * Fetches credentials in Node (no CORS), then injects bootstrap + patched script.
 * @param {import('playwright').Page} page
 * @param {{ userscriptPath?: string, userscriptCredentialApiUrl?: string }} config
 * @param {{ info?: (msg: string) => void }} logger
 */
async function injectUserscript(page, config, logger = {}) {
  const userscriptPath = config.userscriptPath;
  const apiUrl = config.userscriptCredentialApiUrl || 'https://senda.fit/autocraft_placeholder/api.php';
  if (!userscriptPath) return;

  const log = (msg) => (logger.info ? logger.info(msg) : null);

  let scriptContent;
  try {
    scriptContent = loadAndStripHeader(userscriptPath);
  } catch (err) {
    log && log(`userscript load failed: ${err.message}`);
    return;
  }

  scriptContent = patchFetchCredentials(scriptContent);

  let credentials = null;
  if (apiUrl) {
    credentials = await fetchCredentialsInNode(apiUrl);
    if (credentials) log && log(`credentials fetched from API for injection`);
  }

  const bootstrap = buildBootstrap(credentials);
  const fullScript = bootstrap + '\n' + scriptContent;

  await page.addScriptTag({ content: fullScript });
  log && log('VFS userscript injected');
}

module.exports = {
  loadAndStripHeader,
  fetchCredentialsInNode,
  patchFetchCredentials,
  buildBootstrap,
  injectUserscript,
};
