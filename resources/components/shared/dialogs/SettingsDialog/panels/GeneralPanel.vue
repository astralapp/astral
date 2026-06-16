<script setup lang="ts">
import BaseToggle from '@/components/shared/core/BaseToggle.vue'
import SettingsRow from '@/components/shared/dialogs/SettingsDialog/SettingsRow.vue'
import { Appearance, useAppearance } from '@/composables/useAppearance'
import { useAuth } from '@/composables/use-auth'
import { CloneProtocol, useCloneProtocol } from '@/composables/useCloneProtocol'
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'
import { router } from 'hybridly'

const { user } = useAuth()
const { cloneProtocol } = useCloneProtocol()
const { appearance } = useAppearance()

const updateUserSetting = (key: keyof App.Data.UserSettingsData, enabled: boolean) => {
  router.put(route('settings.update'), {
    data: { enabled, key },
    only: ['user'],
  })
}

const appearanceOptions = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
] satisfies Array<{ label: string; value: Appearance }>

const protocolOptions = [
  { label: 'SSH', value: 'ssh' },
  { label: 'HTTPS', value: 'https' },
] satisfies Array<{ label: string; value: CloneProtocol }>
</script>

<template>
  <div class="divide-y divide-gray-200 dark:divide-gray-800">
    <SettingsRow
      title="Appearance"
      description="Choose how Astral looks. System follows your device setting."
    >
      <RadioGroup
        v-model="appearance"
        class="inline-flex rounded-md bg-gray-100 p-0.5 dark:bg-gray-950/60"
      >
        <RadioGroupLabel class="sr-only">Appearance</RadioGroupLabel>

        <RadioGroupOption
          v-for="option in appearanceOptions"
          :key="option.value"
          v-slot="{ active, checked }"
          as="template"
          :value="option.value"
        >
          <div
            class="flex cursor-pointer items-center gap-x-1.5 rounded-sm px-2.5 py-1 text-xs font-bold transition-colors focus-visible:outline-hidden"
            :class="[
              checked
                ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-800 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              active ? 'ring-2 ring-brand-500/40' : '',
            ]"
          >
            <i-lucide-monitor
              v-if="option.value === 'system'"
              class="h-3.5 w-3.5"
              role="presentation"
            />

            <i-lucide-sun
              v-else-if="option.value === 'light'"
              class="h-3.5 w-3.5"
              role="presentation"
            />

            <i-lucide-moon
              v-else
              class="h-3.5 w-3.5"
              role="presentation"
            />

            {{ option.label }}
          </div>
        </RadioGroupOption>
      </RadioGroup>
    </SettingsRow>

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
      title="Show GitHub topics"
      description="Show each repo's GitHub topics as chips you can filter by."
    >
      <BaseToggle
        label="Show GitHub topics"
        :enabled="user?.settings.show_topics"
        @change="updateUserSetting('show_topics', !!$event)"
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
