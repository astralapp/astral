<script lang="ts" setup>
import { watch, ref, nextTick } from 'vue'
import { useForm } from '@inertiajs/vue3'
import { Errors } from '@inertiajs/core'
import BaseDialog from '@/views/components/shared/core/BaseDialog.vue'
import BaseTextInput from '@/views/components/shared/core/BaseTextInput.vue'
import BaseButton from '@/views/components/shared/core/BaseButton.vue'
import { DialogTitle } from '@headlessui/vue'
import { useSmartFilterDialog } from '@/scripts/composables/useSmartFilterDialog'
import SmartFilterEditor from '@/views/components/smart-filter-editor/SmartFilterEditor.vue'
import { defaultGroup } from '@/scripts/utils/predicates'
import { useSmartFiltersStore } from '@/scripts/store/useSmartFiltersStore'
import cloneDeep from 'lodash/cloneDeep'
import { SmartFilter } from '@/scripts/types'
import { useGlobalToast, ToastType } from '@/scripts/composables/useGlobalToast'
import { SPONSORSHIP_REQUIRED_ERROR } from '@/scripts/constants'

const smartFiltersStore = useSmartFiltersStore()

const { isOpen, hide, currentSmartFilter } = useSmartFilterDialog()
const { show: showToast } = useGlobalToast()
const scrollTarget = ref<HTMLElement>()

const form = useForm<Pick<SmartFilter, 'name' | 'body'>>({
  name: '',
  body: JSON.stringify({
    groups: [cloneDeep(defaultGroup)],
  }),
})

watch(currentSmartFilter, smartFilter => {
  if (smartFilter) {
    form.name = smartFilter.name
    form.body = smartFilter.body
  }
})

watch(
  () => form.body,
  async () => {
    if (scrollTarget.value) {
      await nextTick()
      scrollTarget.value.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
    }
  }
)

const addSmartFilter = async () => {
  try {
    await smartFiltersStore.addSmartFilter(form)
    showToast(`The '${form.name}' smart filter was added.`)
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
      await smartFiltersStore.updateSmartFilter(currentSmartFilter.value.id, form)
      showToast(`The '${form.name}' smart filter was updated.`)
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
  form.name = ''
  form.body = JSON.stringify({
    groups: [cloneDeep(defaultGroup)],
  })
}
</script>

<template>
  <BaseDialog :is-open="isOpen" :hide="hideDialog" dialog-classes="px-4 pt-5 pb-4 sm:p-6 sm:max-w-3xl">
    <div>
      <DialogTitle class="rounded bg-gray-50 px-4 py-3 text-center text-xl font-bold text-gray-700"
        >{{ currentSmartFilter ? 'Update' : 'Create' }} smart filter</DialogTitle
      >

      <form @submit.prevent="currentSmartFilter ? updateSmartFilter() : addSmartFilter()">
        <div class="mt-6 flex w-1/2 flex-col items-start pb-8 pt-2">
          <label for="smart-filter-name" class="inline-block text-sm">Filter name</label>

          <BaseTextInput
            id="smart-filter-name"
            v-model="form.name"
            class="mt-2 w-full"
            placeholder="Give your filter a name..."
          ></BaseTextInput>
        </div>

        <div class="max-h-[62vh] overflow-y-auto border-t border-gray-200">
          <SmartFilterEditor v-model="form.body" />

          <div ref="scrollTarget" class="scroll-target" aria-hidden="true"></div>
        </div>

        <div class="mt-4 flex items-center justify-end space-x-2 rounded bg-gray-50 px-4 py-3">
          <BaseButton kind="base" @click="hideDialog">Cancel</BaseButton>

          <BaseButton kind="primary" type="submit">{{ currentSmartFilter ? 'Save' : 'Create' }}</BaseButton>
        </div>
      </form>
    </div>
  </BaseDialog>
</template>
