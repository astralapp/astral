import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Standalone config on purpose: vite.config.ts loads the hybridly plugin,
// which shells out to `php artisan` and must never run under vitest.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./resources', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['resources/**/*.test.ts'],
  },
})
