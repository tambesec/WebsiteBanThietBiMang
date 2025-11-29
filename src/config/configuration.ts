/**
 * Helper function to safely parse integers with fallback
 */
const getInt = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Configuration factory - returns typed config object
 */
export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: getInt(process.env.PORT, 3000),
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET || 'default-secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
  },
  security: {
    bcryptRounds: getInt(process.env.BCRYPT_ROUNDS, 10),
    maxLoginAttempts: getInt(process.env.MAX_LOGIN_ATTEMPTS, 5),
    lockDurationMinutes: getInt(process.env.LOCK_DURATION_MINUTES, 30),
    passwordHistoryCount: getInt(process.env.PASSWORD_HISTORY_COUNT, 5),
  },
  throttle: {
    ttl: getInt(process.env.THROTTLE_TTL, 60),
    limit: getInt(process.env.THROTTLE_LIMIT, 10),
  },
});
