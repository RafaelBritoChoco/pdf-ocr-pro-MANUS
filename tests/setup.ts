// Setup file for Jest tests
// This file runs before each test file

// Mock console.log to avoid noise in tests
global.console = {
  ...console,
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

// Simple test setup without Jest globals
