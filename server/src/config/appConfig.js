/**
 * Parses a comma-separated origin list into an array of trimmed values.
 *
 * @param {string | undefined} rawValue - Raw environment string.
 * @returns {string[]} Sanitized origin list.
 */
function parseAllowedOrigins(rawValue) {
  if (!rawValue) {
    return ['http://localhost:5173'];
  }

  return rawValue
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

/**
 * Reads and normalizes server configuration from environment variables.
 *
 * @returns {{
 *   nodeEnv: string,
 *   port: number,
 *   clientOrigins: string[],
 *   jwtSecret: string,
 *   authProvider: string,
 *   databaseFilePath: string
 * }} Application config object.
 */
export function getApplicationConfig() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number.parseInt(process.env.PORT || '3001', 10),
    clientOrigins: parseAllowedOrigins(process.env.CLIENT_ORIGINS),
    jwtSecret: process.env.JWT_SECRET || 'local-dev-secret-change-me',
    authProvider: process.env.AUTH_PROVIDER || 'local-jwt',
    databaseFilePath: process.env.LOCAL_DB_FILE || 'server/storage/local-firestore.json',
  };
}
