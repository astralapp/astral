<script setup lang="ts">
import { useAuth } from '@/composables/use-auth'
import { SettingsTab } from '@/types'
import { throttle } from 'lodash'
import { computed, ref } from 'vue'
import ConfettiExplosion from 'vue-confetti-explosion'

const CONFETTI_DURATION = 3500

defineProps<{
  activeTab: SettingsTab
}>()

const emit = defineEmits<{
  (e: 'tab-selected', tab: SettingsTab): void
}>()

const { user } = useAuth()

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'shortcuts', label: 'Shortcuts' },
  { id: 'data-controls', label: 'Data controls' },
] satisfies Array<{ id: SettingsTab; label: string }>

const displayName = computed(() => user.value?.name || user.value?.username || 'Your account')
const handle = computed(() => (user.value?.name ? `@${user.value.username}` : null))

const isSponsor = ref(user.value?.isSponsor ?? false)
const justConfirmedSponsorship = ref(false)

const checkSponsorshipStatus = throttle(
  () => {
    isSponsor.value = true
    justConfirmedSponsorship.value = true
    setTimeout(() => {
      justConfirmedSponsorship.value = false
    }, CONFETTI_DURATION)
  },
  CONFETTI_DURATION,
  { leading: true, trailing: false }
)
</script>

<template>
  <aside
    class="flex shrink-0 flex-col gap-y-5 border-b border-gray-950/40 bg-gray-900 p-4 dark:border-gray-950 dark:bg-gray-800 sm:w-[244px] sm:gap-y-7 sm:border-b-0 sm:border-r sm:p-5"
  >
    <div class="relative">
      <div class="flex items-center gap-x-3">
        <img
          :src="user?.avatar ?? undefined"
          :alt="user?.username"
          class="image-rendering-crisp h-10 w-10 shrink-0 rounded-md"
        />

        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-white">{{ displayName }}</p>

          <p
            v-if="handle"
            class="truncate text-xs text-gray-400"
          >
            {{ handle }}
          </p>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-between gap-x-2 rounded-md bg-white/5 px-3 py-2">
        <span class="flex min-w-0 items-center gap-x-1.5 text-xs font-semibold">
          <template v-if="isSponsor">
            <i-lucide-heart
              class="h-3.5 w-3.5 shrink-0 text-brand-400"
              role="presentation"
            />

            <span class="text-brand-400">Sponsor</span>
          </template>

          <span
            v-else
            class="text-gray-400"
            >Not sponsoring</span
          >
        </span>

        <button
          type="button"
          class="shrink-0 cursor-pointer rounded-sm text-xs font-semibold text-gray-300 transition-colors hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/40"
          @click="checkSponsorshipStatus"
        >
          {{ isSponsor ? 'Recheck' : 'Check' }}
        </button>
      </div>

      <div class="pointer-events-none absolute left-1/2 top-full flex justify-center">
        <ConfettiExplosion v-if="justConfirmedSponsorship && isSponsor" />
      </div>
    </div>

    <nav
      class="-mx-1 flex gap-x-1 overflow-x-auto px-1 sm:mx-0 sm:flex-col sm:gap-y-1 sm:overflow-visible sm:px-0"
      aria-label="Settings sections"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :aria-current="activeTab === tab.id ? 'page' : undefined"
        class="group flex shrink-0 items-center gap-x-2.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/40"
        :class="activeTab === tab.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'"
        @click="emit('tab-selected', tab.id)"
      >
        <i-lucide-sliders-horizontal
          v-if="tab.id === 'general'"
          class="h-4 w-4 shrink-0 transition-colors"
          :class="activeTab === tab.id ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'"
          role="presentation"
        />

        <i-lucide-keyboard
          v-else-if="tab.id === 'shortcuts'"
          class="h-4 w-4 shrink-0 transition-colors"
          :class="activeTab === tab.id ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'"
          role="presentation"
        />

        <i-lucide-shield-alert
          v-else
          class="h-4 w-4 shrink-0 transition-colors"
          :class="activeTab === tab.id ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'"
          role="presentation"
        />

        <span>{{ tab.label }}</span>
      </button>
    </nav>
  </aside>
</template>
