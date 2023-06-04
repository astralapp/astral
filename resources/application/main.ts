import { initializeHybridly } from 'virtual:hybridly/config'
import { createHead } from '@vueuse/head'
import './tailwind.css'

initializeHybridly({
	enhanceVue: (vue) => {
		vue.use(createHead({
			titleTemplate: (title) => title ? `${title} — Astral` : 'Astral',
		}))
	},
})
