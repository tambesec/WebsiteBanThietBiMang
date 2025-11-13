import dotenv from 'dotenv';

dotenv.config();

export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    API_VERSION: process.env.API_VERSION || 'v1',

    // Database
    DATABASE_URL: process.env.DATABASE_URL || '',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '30d',

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],

    // Email
    SMTP_HOST: process.env.SMTP_HOST || '',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',

    // File Upload
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',

    // Pagination
    DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
    MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),

    // Security
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    SESSION_EXPIRY: parseInt(process.env.SESSION_EXPIRY || '3600', 10),

    // Rate Limiting
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};

export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
