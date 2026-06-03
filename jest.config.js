module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'vue'],
  // Nuxt-style path aliases (@/ and ~/ both resolve to the project root)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js',
    // Stub out styles and static assets so component imports don't choke
    '\\.(css|scss|sass|less)$': '<rootDir>/test/mocks/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg|mp4|webm)$': '<rootDir>/test/mocks/fileMock.js'
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue2-jest'
  },
  // Most node_modules ship CJS; transpile only the ESM-only ones we actually use.
  transformIgnorePatterns: [
    '/node_modules/(?!(@hiveio|hive-auth-wrapper)/)'
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testMatch: ['<rootDir>/test/**/*.spec.js'],
  collectCoverageFrom: [
    'store/**/*.js',
    'utils/**/*.js',
    'plugins/**/*.js',
    'api/**/*.js',
    'components/**/*.vue',
    '!**/node_modules/**'
  ],
  coverageDirectory: '<rootDir>/coverage'
}
