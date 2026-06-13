<script setup lang="ts">
import BaseDialog from '@/components/shared/core/BaseDialog.vue'
import SettingsRail from '@/components/shared/dialogs/SettingsDialog/SettingsRail.vue'
import DataControlsPanel from '@/components/shared/dialogs/SettingsDialog/panels/DataControlsPanel.vue'
import GeneralPanel from '@/components/shared/dialogs/SettingsDialog/panels/GeneralPanel.vue'
import ShortcutsPanel from '@/components/shared/dialogs/SettingsDialog/panels/ShortcutsPanel.vue'
import { useSettingsDialog } from '@/composables/useSettingsDialog'
import { SettingsTab } from '@/types'
import { DialogTitle } from '@headlessui/vue'
import { computed, ref } from 'vue'

const { isOpen, hide } = useSettingsDialog()

const activeTab = ref<SettingsTab>('general')

const sections = {
  general: { description: 'Tune how your library looks and behaves.', title: 'General' },
  shortcuts: { description: 'Move through Astral without leaving the keyboard.', title: 'Shortcuts' },
  'data-controls': { description: 'Manage your GitHub connection and your account.', title: 'Data controls' },
} satisfies Record<SettingsTab, { description: string; title: string }>

const activeSection = computed(() => sections[activeTab.value])
</script>

<template>
  <BaseDialog
    :is-open="isOpen"
    :hide="hide"
    dialog-classes="w-full sm:w-[820px] sm:max-w-[calc(100vw-3rem)] sm:h-[600px] sm:max-h-[calc(100vh-4rem)]"
  >
    <DialogTitle class="sr-only">Settings</DialogTitle>

    <div class="flex flex-col sm:h-full sm:flex-row">
      <SettingsRail
        :active-tab="activeTab"
        @tab-selected="activeTab = $event"
      />

      <section class="flex min-w-0 flex-1 flex-col bg-white dark:bg-gray-900">
        <header
          class="flex items-start justify-between gap-x-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:px-8 sm:py-5"
        >
          <div class="min-w-0">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ activeSection.title }}</h2>

            <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{{ activeSection.description }}</p>
          </div>

          <button
            type="button"
            aria-label="Close settings"
            class="-mr-2 -mt-1 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            @click="hide"
          >
            <i-lucide-x
              class="h-5 w-5"
              role="presentation"
            />
          </button>
        </header>

        <div class="flex-1 overflow-y-auto px-6 py-4 sm:px-8 sm:py-5">
          <Transition
            name="panel"
            mode="out-in"
          >
            <GeneralPanel
              v-if="activeTab === 'general'"
              key="general"
            />

            <ShortcutsPanel
              v-else-if="activeTab === 'shortcuts'"
              key="shortcuts"
            />

            <DataControlsPanel
              v-else
              key="data-controls"
            />
          </Transition>
        </div>
      </section>
    </div>
  </BaseDialog>
</template>

<style scoped>
.panel-enter-active,
.panel-leave-active {
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}

.panel-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .panel-enter-active,
  .panel-leave-active {
    transition: none;
  }

  .panel-enter-from,
  .panel-leave-to {
    transform: none;
  }
}
</style>
