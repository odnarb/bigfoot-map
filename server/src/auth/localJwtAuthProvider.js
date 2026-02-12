import jwt from 'jsonwebtoken';
import { createSafeError } from '../utils/errorUtils.js';

/**
 * Creates a local JWT authentication provider that can be swapped later.
 *
 * @param {{ jwtSecret: string }} config - Auth config.
 * @returns {{
 *   login: (username: string, password: string) => Promise<{ accessToken: string, user: { userId: string, username: string, role: string } }>,
 *   verifyToken: (token: string) => Promise<{ userId: string, username: string, role: string }>
 * }} Auth provider.
 */
export function createLocalJwtAuthProvider(config) {
  const localUsers = [
    { userId: 'user_researcher', username: 'researcher', password: 'researcher123', role: 'researcher' },
    { userId: 'user_admin', username: 'admin', password: 'admin123', role: 'admin' },
  ];

  return {
    /**
     * Validates credentials and returns a signed JWT.
     *
     * @param {string} username - Username.
     * @param {string} password - Password.
     * @returns {Promise<{ accessToken: string, user: { userId: string, username: string, role: string } }>} Signed token + user profile.
     * @throws {SafeError} When credentials are invalid.
     */
    async login(username, password) {
      const matchingUser = localUsers.find(
        (user) => user.username === username && user.password === password,
      );

      if (!matchingUser) {
        throw createSafeError(
          'Invalid username or password.',
          401,
          'AUTH_INVALID_CREDENTIALS',
          { username },
        );
      }

      const tokenPayload = {
        userId: matchingUser.userId,
        username: matchingUser.username,
        role: matchingUser.role,
      };

      const accessToken = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '8h' });

      return {
        accessToken,
        user: tokenPayload,
      };
    },

    /**
     * Verifies one JWT and returns user claims.
     *
     * @param {string} token - Bearer token without prefix.
     * @returns {Promise<{ userId: string, username: string, role: string }>} Verified user claims.
     * @throws {SafeError} When token is invalid or expired.
     */
    async verifyToken(token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        return {
          userId: String(decoded.userId),
          username: String(decoded.username),
          role: String(decoded.role),
        };
      } catch (error) {
        throw createSafeError(
          'Authentication is required for this action.',
          401,
          'AUTH_TOKEN_INVALID',
          { error: String(error) },
        );
      }
    },
  };
}
