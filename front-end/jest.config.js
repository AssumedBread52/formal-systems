const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: [
    './jest.setup.js'
  ],
  testEnvironment: 'jest-environment-jsdom'
};

module.exports = createJestConfig(config);
