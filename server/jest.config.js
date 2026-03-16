// Jest configuration
export default {
    testEnvironment: 'node',
    transform: {},
    verbose: true,
    testMatch: ['**/tests/**/*.test.js'],
    setupFilesAfterEnv: [],
    testTimeout: 60000,
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    }
};
