import hybridly from 'hybridly/vite'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  plugins: [
    hybridly({
      icons: false,
      laravel: {
        detectTls: true,
      },
      vue: {
        script: {
          defineModel: true,
          propsDestructure: true,
        },
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
