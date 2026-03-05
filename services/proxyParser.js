function parseProxyUrl(url) {
  const s = (url || '').trim();
  if (!s) return null;
  try {
    let match = s.match(/^(https?):\/\/(?:([^:@]+):([^@]+)@)?([^:\/]+):(\d+)$/);
    if (match) {
      const [, , username, password, server, port] = match;
      return { server, port: String(port), username: username || '', password: password || '' };
    }
    match = s.match(/^([^:]+):(\d+):([^:]+):(.+)$/);
    if (match) {
      const [, server, port, username, password] = match;
      return { server, port: String(port), username, password };
    }
    return null;
  } catch (_) {
    return null;
  }
}

function parseProxyList(urlStrings) {
  return (urlStrings || []).map(parseProxyUrl).filter(Boolean);
}

module.exports = { parseProxyUrl, parseProxyList };
