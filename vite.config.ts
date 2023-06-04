import { defineConfig } from 'vite'
import hybridly from 'hybridly/vite'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/resources',
    },
  },
  plugins: [
    hybridly({
      laravel: {
        valetTls: true,
      },
    }),
    svgLoader({ svgo: false }),
  ],
})
