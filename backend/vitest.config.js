import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Focus coverage analysis on business-critical src files only.
      // Exclude: routes, config boilerplate, seed scripts, sockets, migration utilities.
      include: [
        'src/controllers/**/*.js',
        'src/services/**/*.js',
        'src/lib/**/*.js',
        'src/middleware/**/*.js',
      ],
      exclude: [
        'src/services/socketServer.js',
        'src/lib/defaultOrgStructure.js',
        '**/*.test.js',
        '**/seed*.js',
        '**/scripts/**',
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
});
