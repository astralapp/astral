import { createHead } from '@vueuse/head'
import { createPinia } from 'pinia'
import { initializeHybridly } from 'virtual:hybridly/config'
import { VueQueryPlugin } from '@tanstack/vue-query'

import './tailwind.css'

initializeHybridly({
  enhanceVue: vue => {
    vue
      .use(
        createHead({
          titleTemplate: title => (title ? `${title} — Astral` : 'Astral'),
        })
      )
      .use(createPinia())
      .use(VueQueryPlugin)
  },
  progress: {
    color: '#059669',
  },
})
