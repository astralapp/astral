import hybridly from 'hybridly/vite'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  plugins: [
    hybridly({
      laravel: {
        valetTls: true,
      },
    }),
    svgLoader({ svgo: false }),
  ],
  resolve: {
    alias: {
      '@': '/resources',
    },
  },
})
