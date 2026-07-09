import { createHead } from '@vueuse/head'
import { createPinia } from 'pinia'
import { initializeHybridly } from 'virtual:hybridly/config'

import 'driver.js/dist/driver.css'
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
  },
  progress: {
    color: '#059669',
  },
})
