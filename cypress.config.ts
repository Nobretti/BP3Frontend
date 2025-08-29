import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts',
    chromeWebSecurity: false,
  },
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  video: false,
  screenshotOnRunFailure: true,
});
