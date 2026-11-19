function normalizeHost(value) {
  const input = value.trim();
  if (!input) return '';

  const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(input) ? input : `http://${input}`);
  return url.hostname
    .toLowerCase()
    .replace(/^\*\./, '')
    .replace(/^www\./, '')
    .replace(/\.$/, '');
}

function matches(host, pattern) {
  try {
    const normalizedHost = normalizeHost(host);
    const normalizedPattern = normalizeHost(pattern);
    return !!normalizedHost && !!normalizedPattern
      && (normalizedHost === normalizedPattern || normalizedHost.endsWith(`.${normalizedPattern}`));
  } catch {
    return false;
  }
}

module.exports = matches;
