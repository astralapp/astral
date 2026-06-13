<script setup lang="ts">
import BaseButton from '@/components/shared/core/BaseButton.vue'
import ToolbarButton from '@/components/toolbar/ToolbarButton.vue'
import { useCloneProtocol } from '@/composables/useCloneProtocol'
import { ToastType, useGlobalToast } from '@/composables/useGlobalToast'
import { useStarsStore } from '@/store/useStarsStore'
import { isFocusedElementEditable } from '@/utils'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { onKeyStroke, useClipboard } from '@vueuse/core'
import { computed, ref } from 'vue'

const { cloneProtocol } = useCloneProtocol()
const starsStore = useStarsStore()
const { show: showToast } = useGlobalToast()

const urlInput = ref<HTMLInputElement | null>(null)

const cloneUrl = computed(() =>
  cloneProtocol.value === 'ssh'
    ? `git@github.com:${starsStore.selectedRepo?.nameWithOwner}.git`
    : `${starsStore.selectedRepo?.url}.git`
)

const { copy, copied } = useClipboard({ legacy: true })

const copyUrl = () => {
  copy(cloneUrl.value)
  showToast('Clone URL copied to your clipboard', ToastType.Success)
}

const selectUrl = () => urlInput.value?.select()

// `c` copies the clone URL (using the saved protocol) without opening anything;
// the popover is for switching protocol before copying.
onKeyStroke('c', e => {
  if (isFocusedElementEditable() || e.metaKey || e.ctrlKey) return

  e.preventDefault()
  copyUrl()
})
</script>

<template>
  <Popover
    v-slot="{ open }"
    class="relative"
  >
    <PopoverButton
      :as="ToolbarButton"
      :active="open"
      label="Clone repository"
      aria-keyshortcuts="c"
    >
      <i-lucide-code class="h-4 w-4" />
    </PopoverButton>

    <transition
      enter-active-class="transition duration-100 ease-out motion-reduce:transition-none"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in motion-reduce:transition-none"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <PopoverPanel
        class="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-1.5rem)] origin-top-right rounded-md border border-gray-200 bg-white p-3 shadow-lg ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-800"
        @after-enter="selectUrl"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Clone</p>

          <div
            class="flex shrink-0 items-center gap-0.5 rounded-full bg-gray-100 p-0.5 dark:bg-gray-950"
            role="group"
            aria-label="Clone protocol"
          >
            <button
              v-for="protocol in (['ssh', 'https'] as const)"
              :key="protocol"
              type="button"
              class="cursor-pointer rounded-full px-2.5 py-0.5 text-xxs font-bold uppercase tracking-wide transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600"
              :class="
                cloneProtocol === protocol
                  ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-700 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              "
              :aria-pressed="cloneProtocol === protocol"
              @click="cloneProtocol = protocol"
            >
              {{ protocol }}
            </button>
          </div>
        </div>

        <div class="mt-2.5 flex items-center gap-2">
          <input
            ref="urlInput"
            :value="cloneUrl"
            readonly
            type="text"
            aria-label="Clone URL"
            class="min-w-0 flex-auto rounded-md border border-gray-300 bg-gray-50 px-2.5 py-1.5 font-mono text-xs text-gray-700 focus:border-gray-400 focus:outline-hidden focus:ring-2 focus:ring-gray-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
            @focus="selectUrl"
          />

          <BaseButton
            kind="primary"
            size="sm"
            class="shrink-0"
            @click="copyUrl"
          >
            <i-lucide-check
              v-if="copied"
              class="-ml-0.5 mr-1 h-4 w-4"
              role="presentation"
            />

            <i-lucide-copy
              v-else
              class="-ml-0.5 mr-1 h-4 w-4"
              role="presentation"
            />

            <span>{{ copied ? 'Copied' : 'Copy' }}</span>
          </BaseButton>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>
