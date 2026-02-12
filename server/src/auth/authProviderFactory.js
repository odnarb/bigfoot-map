import { createSafeError } from '../utils/errorUtils.js';
import { createLocalJwtAuthProvider } from './localJwtAuthProvider.js';

/**
 * Creates a pluggable authentication provider.
 *
 * @param {{ authProvider: string, jwtSecret: string }} appConfig - App config.
 * @returns {{
 *   login: (username: string, password: string) => Promise<{ accessToken: string, user: { userId: string, username: string, role: string } }>,
 *   verifyToken: (token: string) => Promise<{ userId: string, username: string, role: string }>
 * }} Auth provider implementation.
 * @throws {SafeError} When provider name is unknown.
 */
export function createAuthProvider(appConfig) {
  if (appConfig.authProvider === 'local-jwt') {
    return createLocalJwtAuthProvider(appConfig);
  }

  throw createSafeError(
    'Authentication provider is not configured correctly.',
    500,
    'AUTH_PROVIDER_INVALID',
    { authProvider: appConfig.authProvider },
  );
}
