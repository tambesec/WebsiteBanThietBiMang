module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@routes/(.*)$': '<rootDir>/src/routes/$1',
        '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@validators/(.*)$': '<rootDir>/src/validators/$1',
        '^@types/(.*)$': '<rootDir>/src/types/$1',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/index.ts',
        '!src/server.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
};
