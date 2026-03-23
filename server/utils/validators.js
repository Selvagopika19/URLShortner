/**
 * Validates that a string is a safe, absolute HTTP(S) URL for shortening.
 */
export function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

/**
 * Builds the public short link string for API responses.
 */
export function buildShortLink(shortCode) {
  const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  return base ? `${base}/${shortCode}` : `/${shortCode}`;
}
