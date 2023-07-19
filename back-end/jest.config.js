/** @type {import('jest').Config} */
module.exports = {
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/$1'
  },
  rootDir: 'modules',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
};
