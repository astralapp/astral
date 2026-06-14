import hybridly from 'hybridly/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
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
    // Hybridly 0.10 dropped the unplugin integrations its vite plugin used to
    // bundle, so the app configures them: auto-imported Hybridly composables
    // and Iconify icon components (i-lucide-*, i-ph-*) used across templates.
    AutoImport({
      dts: 'resources/types/auto-imports.d.ts',
      vueTemplate: true,
      imports: ['vue', { 'hybridly/vue': ['route', 'useForm', 'useProperty', 'registerHook'] }],
    }),
    Components({
      dts: 'resources/types/components.d.ts',
      dirs: [],
      resolvers: [IconsResolver()],
    }),
    Icons({ compiler: 'vue3', autoInstall: false }),
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
