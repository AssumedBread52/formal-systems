const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

/** @type {import('jest').Config} */
const config = {
  globals: {
    fetch,
    Request,
    Response
  },
  testEnvironment: 'jest-environment-jsdom'
};

module.exports = createJestConfig(config);
