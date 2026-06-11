import hybridly from 'hybridly/vite'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  plugins: [
    hybridly({
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
  server: {
    watch: {
      // Docker bind mounts on macOS don't forward inotify events into the
      // container, so Vite's watcher never sees host edits. Poll instead.
      usePolling: true,
      interval: 300,
    },
  },
})
