/** @type {import('jest').Config} */
module.exports = {
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/modules/$1'
  },
  rootDir: '.',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
};
