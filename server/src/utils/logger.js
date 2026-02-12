/**
 * Removes stack traces and other high-risk properties before logging.
 *
 * @param {unknown} value - Value to sanitize.
 * @returns {unknown} Safe log payload.
 */
function sanitizeLogValue(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeLogValue(entry));
  }

  const sanitizedObject = {};

  for (const [key, entryValue] of Object.entries(value)) {
    if (key.toLowerCase().includes('token')) continue;
    if (key.toLowerCase().includes('secret')) continue;
    if (key.toLowerCase().includes('password')) continue;
    if (key.toLowerCase() === 'stack') continue;
    sanitizedObject[key] = sanitizeLogValue(entryValue);
  }

  return sanitizedObject;
}

/**
 * Creates a namespaced logger with consistent JSON-style logging.
 *
 * @param {string} namespace - Logical logger namespace.
 * @returns {{
 *  info: (message: string, payload?: unknown) => void,
 *  warn: (message: string, payload?: unknown) => void,
 *  error: (message: string, payload?: unknown) => void
 * }} Logger helpers.
 */
export function createLogger(namespace) {
  /**
   * Logs one line with sanitized structured payload.
   *
   * @param {'info' | 'warn' | 'error'} level - Log level.
   * @param {string} message - Human-readable message.
   * @param {unknown} payload - Optional structured payload.
   * @returns {void}
   */
  function log(level, message, payload) {
    const line = {
      timestamp: new Date().toISOString(),
      level,
      namespace,
      message,
      payload: sanitizeLogValue(payload),
    };

    if (level === 'error') {
      console.error(JSON.stringify(line));
      return;
    }

    if (level === 'warn') {
      console.warn(JSON.stringify(line));
      return;
    }

    console.info(JSON.stringify(line));
  }

  return {
    info: (message, payload) => log('info', message, payload),
    warn: (message, payload) => log('warn', message, payload),
    error: (message, payload) => log('error', message, payload),
  };
}
