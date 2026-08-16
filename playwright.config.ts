import { defineConfig, devices } from '@playwright/test';

/**
 * E2E (§49): flujo completo del MVP contra el build de producción real
 * (PWA + service worker), no contra el dev server.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4173',
    ...devices['Pixel 5'] // móvil primero (§70)
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 60_000
  }
});
