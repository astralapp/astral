<script setup lang="ts">
import BaseToggle from '@/components/shared/core/BaseToggle.vue'
import SettingsRow from '@/components/shared/dialogs/SettingsDialog/SettingsRow.vue'
import { useAuth } from '@/composables/use-auth'
import { CloneProtocol, useCloneProtocol } from '@/composables/useCloneProtocol'
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'
import { router } from 'hybridly'

const { user } = useAuth()
const { cloneProtocol } = useCloneProtocol()

const updateUserSetting = (key: keyof App.Data.UserSettingsData, enabled: boolean) => {
  router.put(route('settings.update'), {
    data: { enabled, key },
    only: ['user'],
  })
}

const protocolOptions = [
  { label: 'SSH', value: 'ssh' },
  { label: 'HTTPS', value: 'https' },
] satisfies Array<{ label: string; value: CloneProtocol }>
</script>

<template>
  <div class="divide-y divide-gray-200 dark:divide-gray-800">
    <SettingsRow
      title="Show language tags"
      description="Show each repo's primary language as a tag in your list."
    >
      <BaseToggle
        label="Show language tags"
        :enabled="user?.settings.show_language_tags"
        @change="updateUserSetting('show_language_tags', !!$event)"
      />
    </SettingsRow>

    <SettingsRow
      title="Auto-save notes"
      description="Save notes automatically every few seconds as you type."
    >
      <BaseToggle
        label="Auto-save notes"
        :enabled="user?.settings.autosave_notes"
        @change="updateUserSetting('autosave_notes', !!$event)"
      />
    </SettingsRow>

    <SettingsRow
      title="Preferred clone protocol"
      description="Set the URL format the clone field uses on each repo."
    >
      <RadioGroup
        v-model="cloneProtocol"
        class="inline-flex rounded-md bg-gray-100 p-0.5 dark:bg-gray-950/60"
      >
        <RadioGroupLabel class="sr-only">Preferred clone protocol</RadioGroupLabel>

        <RadioGroupOption
          v-for="option in protocolOptions"
          :key="option.value"
          v-slot="{ active, checked }"
          as="template"
          :value="option.value"
        >
          <div
            class="cursor-pointer rounded-sm px-3 py-1 text-xs font-bold tracking-wide transition-colors focus-visible:outline-hidden"
            :class="[
              checked
                ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-800 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              active ? 'ring-2 ring-brand-500/40' : '',
            ]"
          >
            {{ option.label }}
          </div>
        </RadioGroupOption>
      </RadioGroup>
    </SettingsRow>
  </div>
</template>
