<script lang="ts" setup>
import BaseButton from '@/components/shared/core/BaseButton.vue'
import BaseDialog from '@/components/shared/core/BaseDialog.vue'
import BaseTextInput from '@/components/shared/core/BaseTextInput.vue'
import SmartFilterEditor from '@/components/smart-filter-editor/SmartFilterEditor.vue'
import { ToastType, useGlobalToast } from '@/composables/useGlobalToast'
import { useSmartFilterDialog } from '@/composables/useSmartFilterDialog'
import { SPONSORSHIP_REQUIRED_ERROR } from '@/constants'
import { useSmartFiltersStore } from '@/store/useSmartFiltersStore'
import { useStarsStore } from '@/store/useStarsStore'
import { Errors } from '@/types'
import { defaultGroup, evaluateSmartFilterBody, parseSmartFilterBody } from '@/utils/predicates'
import { DialogTitle } from '@headlessui/vue'
import { refDebounced } from '@vueuse/core'
import cloneDeep from 'lodash/cloneDeep'
import { computed, nextTick, ref, watch } from 'vue'

const smartFiltersStore = useSmartFiltersStore()
const starsStore = useStarsStore()

const { isOpen, hide, currentSmartFilter } = useSmartFilterDialog()
const { show: showToast } = useGlobalToast()
const scrollTarget = ref<HTMLElement>()

const form = useForm({
  fields: {
    body: JSON.stringify({
      groups: [cloneDeep(defaultGroup)],
    }),
    name: '',
  },
})

watch(currentSmartFilter, smartFilter => {
  if (smartFilter) {
    form.fields.name = smartFilter.name
    form.fields.body = smartFilter.body
  }
})

// Bring a freshly added condition or group into view, but stay put while the
// user is editing existing values.
const scrollToNewest = async () => {
  await nextTick()
  scrollTarget.value?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
}

// A live, debounced preview of how many stars the current conditions match.
const debouncedBody = refDebounced(
  computed(() => form.fields.body),
  200
)

const previewBody = computed(() => parseSmartFilterBody(debouncedBody.value))

const hasConditionInput = computed(() =>
  previewBody.value.groups.some(group =>
    group.predicates.some(predicate => {
      const argument = predicate.argument

      if (Array.isArray(argument)) {
        return argument.length > 0
      }

      if (argument !== null && typeof argument === 'object') {
        return true
      }

      return String(argument ?? '').trim().length > 0
    })
  )
)

const matchCount = computed(() =>
  starsStore.allStars.reduce(
    (total, repo) =>
      total +
      (evaluateSmartFilterBody(previewBody.value, repo, starsStore.userStarsByRepoId[repo.node.databaseId]) ? 1 : 0),
    0
  )
)

const addSmartFilter = async () => {
  try {
    await smartFiltersStore.addSmartFilter(form.fields)
  } catch (e) {
    const errors = e as Errors
    if (!errors[SPONSORSHIP_REQUIRED_ERROR]) {
      showToast(errors[Object.keys(errors)[0]], ToastType.Error)
    }
  } finally {
    hideDialog()
  }
}

const updateSmartFilter = async () => {
  try {
    if (currentSmartFilter.value) {
      await smartFiltersStore.updateSmartFilter(currentSmartFilter.value.id, form.fields)
    }
  } catch (e) {
    const errors = e as Errors
    if (!errors[SPONSORSHIP_REQUIRED_ERROR]) {
      showToast(errors[Object.keys(errors)[0]], ToastType.Error)
    }
  } finally {
    hideDialog()
  }
}

const hideDialog = () => {
  hide()
  setTimeout(() => {
    resetForm()
  }, 200)
}

const resetForm = () => {
  form.fields.name = ''
  form.fields.body = JSON.stringify({
    groups: [cloneDeep(defaultGroup)],
  })
}
</script>

<template>
  <BaseDialog
    :is-open="isOpen"
    :hide="hideDialog"
    dialog-classes="w-full sm:max-w-2xl"
  >
    <DialogTitle class="sr-only">{{ currentSmartFilter ? 'Update' : 'Create' }} smart filter</DialogTitle>

    <form
      class="flex max-h-[85vh] flex-col sm:max-h-[80vh]"
      @submit.prevent="currentSmartFilter ? updateSmartFilter() : addSmartFilter()"
    >
      <header
        class="flex items-start justify-between gap-x-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 sm:px-7 sm:py-5"
      >
        <div class="min-w-0">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ currentSmartFilter ? 'Update' : 'Create' }} smart filter
          </h2>

          <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            A saved view of every star that matches the conditions below.
          </p>
        </div>

        <button
          type="button"
          aria-label="Close"
          class="-mr-2 -mt-1 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          @click="hideDialog"
        >
          <i-lucide-x
            class="h-5 w-5"
            role="presentation"
          />
        </button>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-7">
        <div class="mb-5">
          <label
            for="smart-filter-name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Filter name</label
          >

          <BaseTextInput
            id="smart-filter-name"
            v-model="form.fields.name"
            class="mt-1.5 w-full"
            placeholder="e.g. Rust tools to revisit"
          ></BaseTextInput>
        </div>

        <SmartFilterEditor
          v-model="form.fields.body"
          @add="scrollToNewest"
        />

        <div
          ref="scrollTarget"
          class="scroll-target"
          aria-hidden="true"
        ></div>
      </div>

      <footer
        class="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-7"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <template v-if="hasConditionInput">
            <span class="font-semibold tabular-nums text-gray-900 dark:text-white">{{
              matchCount.toLocaleString()
            }}</span>
            {{ matchCount === 1 ? 'star matches' : 'stars match' }}
          </template>

          <template v-else>Fill in a condition to preview matches</template>
        </p>

        <div class="flex items-center justify-end gap-2">
          <BaseButton
            kind="base"
            @click="hideDialog"
            >Cancel</BaseButton
          >

          <BaseButton
            kind="primary"
            button-type="submit"
            >{{ currentSmartFilter ? 'Save changes' : 'Create filter' }}</BaseButton
          >
        </div>
      </footer>
    </form>
  </BaseDialog>
</template>
