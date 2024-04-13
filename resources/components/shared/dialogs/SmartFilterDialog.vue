<script lang="ts" setup>
import BaseButton from '@/components/shared/core/BaseButton.vue'
import BaseDialog from '@/components/shared/core/BaseDialog.vue'
import BaseTextInput from '@/components/shared/core/BaseTextInput.vue'
import SmartFilterEditor from '@/components/smart-filter-editor/SmartFilterEditor.vue'
import { ToastType, useGlobalToast } from '@/composables/useGlobalToast'
import { useSmartFilterDialog } from '@/composables/useSmartFilterDialog'
import { SPONSORSHIP_REQUIRED_ERROR } from '@/constants'
import { useSmartFiltersStore } from '@/store/useSmartFiltersStore'
import { Errors } from '@/types'
import { defaultGroup } from '@/utils/predicates'
import { DialogTitle } from '@headlessui/vue'
import cloneDeep from 'lodash/cloneDeep'
import { nextTick, ref, watch } from 'vue'

const smartFiltersStore = useSmartFiltersStore()

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

watch(
  () => form.fields.body,
  async () => {
    if (scrollTarget.value) {
      await nextTick()
      scrollTarget.value.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
    }
  }
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
    console.log(e)
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
    dialog-classes="px-4 pt-5 pb-4 sm:p-6 sm:max-w-3xl"
  >
    <div>
      <DialogTitle
        class="rounded bg-gray-50 dark:bg-gray-900/60 px-4 py-3 text-center text-xl font-bold text-gray-700 dark:text-gray-300"
        >{{ currentSmartFilter ? 'Update' : 'Create' }} smart filter</DialogTitle
      >

      <form @submit.prevent="currentSmartFilter ? updateSmartFilter() : addSmartFilter()">
        <div class="mt-6 flex w-1/2 flex-col items-start pb-8 pt-2">
          <label
            for="smart-filter-name"
            class="inline-block text-sm dark:text-gray-300"
            >Filter name</label
          >

          <BaseTextInput
            id="smart-filter-name"
            v-model="form.fields.name"
            class="mt-2 w-full"
            placeholder="Give your filter a name..."
          ></BaseTextInput>
        </div>

        <div class="max-h-[62vh] overflow-y-auto border-t border-gray-200 dark:border-gray-700">
          <SmartFilterEditor v-model="form.fields.body" />

          <div
            ref="scrollTarget"
            class="scroll-target"
            aria-hidden="true"
          ></div>
        </div>

        <div class="mt-4 flex items-center justify-end space-x-2 rounded bg-gray-50 dark:bg-gray-900/60 px-4 py-3">
          <BaseButton
            kind="base"
            @click="hideDialog"
            >Cancel</BaseButton
          >

          <BaseButton
            kind="primary"
            type="submit"
            >{{ currentSmartFilter ? 'Save' : 'Create' }}</BaseButton
          >
        </div>
      </form>
    </div>
  </BaseDialog>
</template>
