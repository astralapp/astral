declare module 'fuzzysearch' {
  export default function (needle: string, haystack: string): boolean
}

declare module '@heroicons/*'

declare module 'vue-flatpickr-component'

declare module 'vue-confetti-explosion' {
  import { DefineComponent } from 'vue'

  const ConfettiExplosion: DefineComponent<{}, {}, any>

  export default ConfettiExplosion
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
