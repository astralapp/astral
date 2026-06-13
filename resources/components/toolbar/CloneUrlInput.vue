<script setup lang="ts">
import BaseTextInput from '@/components/shared/core/BaseTextInput.vue'
import { useCloneProtocol } from '@/composables/useCloneProtocol'
import { useStarsStore } from '@/store/useStarsStore'
import { isFocusedElementEditable } from '@/utils'
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'
import { onKeyStroke } from '@vueuse/core'
import { computed, ref } from 'vue'

const { cloneProtocol } = useCloneProtocol()
const starsStore = useStarsStore()

const input = ref<null | typeof BaseTextInput>(null)

const cloneUrl = computed(() =>
  cloneProtocol.value === 'ssh'
    ? `git@github.com:${starsStore.selectedRepo?.nameWithOwner}.git`
    : `${starsStore.selectedRepo?.url}.git`
)

const selectUrlText = (e: FocusEvent) => {
  ;(e?.currentTarget as HTMLInputElement)?.select()
}

onKeyStroke('c', e => {
  const inputEl: HTMLInputElement = input.value?.$el
  if (!isFocusedElementEditable() && inputEl && !e.metaKey && !e.ctrlKey) {
    e.preventDefault()
    inputEl.focus()
  }
})
</script>

<template>
  <div class="flex items-center">
    <div>
      <label
        for="repo_clone_url"
        class="cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-300"
        >Clone:</label
      >

      <BaseTextInput
        id="repo_clone_url"
        ref="input"
        v-model="cloneUrl"
        readonly
        class="ml-2 w-60"
        type="text"
        aria-keyshortcuts="c"
        @focus="selectUrlText"
      />
    </div>

    <RadioGroup
      v-model="cloneProtocol"
      class="isolate px-3"
    >
      <RadioGroupLabel class="sr-only">Clone URL Type</RadioGroupLabel>

      <RadioGroupOption
        v-slot="{ checked }"
        as="template"
        value="ssh"
      >
        <div
          class="cursor-pointer rounded-full py-0.5 px-1.5 text-center text-xxs font-bold"
          :class="{
            'bg-transparent text-gray-600 dark:text-gray-400': !checked,
            'bg-gray-600 text-white dark:bg-gray-500': checked,
          }"
        >
          <span>SSH</span>
        </div>
      </RadioGroupOption>

      <RadioGroupOption
        v-slot="{ checked }"
        as="template"
        value="https"
      >
        <div
          class="cursor-pointer rounded-full py-0.5 px-1.5 text-center text-xxs font-bold"
          :class="{
            'bg-transparent text-gray-600 dark:text-gray-400': !checked,
            'bg-gray-600 text-white dark:bg-gray-500': checked,
          }"
        >
          <span>HTTPS</span>
        </div>
      </RadioGroupOption>
    </RadioGroup>
  </div>
</template>
