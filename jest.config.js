const nextJest = require('next/jest')({
  dir: './', // Path to Next.js app to load next.config.js and .env files
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom', // Default, overridden by @jest-environment node where needed
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/app/$1',

    // Handle CSS imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  // moduleDirectories: ['node_modules', '<rootDir>/'], // Usually not needed if paths are set in tsconfig and next/jest works
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: [
    // Allow next-auth to be transformed
    '/node_modules/(?!next-auth)/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  // No explicit preset or transform for ts-jest, let next/jest handle with SWC
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = nextJest(customJestConfig)
