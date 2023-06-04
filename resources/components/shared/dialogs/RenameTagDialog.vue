<script lang="ts" setup>
import { ref, watch, nextTick } from 'vue'
import { useRenameTagDialog } from '@/scripts/composables/useRenameTagDialog'
import ActionDialog from '@/views/components/shared/core/ActionDialog.vue'
import BaseButton from '@/views/components/shared/core/BaseButton.vue'
import BaseTextInput from '@/views/components/shared/core/BaseTextInput.vue'
import { useForm } from '@inertiajs/vue3'

const { isOpen, hide, currentTag } = useRenameTagDialog()
const form = useForm({
  name: '',
})
const input = ref<typeof BaseTextInput | null>(null)

watch([currentTag, isOpen], async ([tag, openState]) => {
  if (tag && openState === true) {
    form.name = tag.name
    await nextTick()

    const inputEl: HTMLInputElement = input.value?.$el
    if (inputEl) inputEl.select()
  } else {
    setTimeout(() => {
      form.clearErrors()
    }, 200)
  }
})

const renameTag = () => {
  if (currentTag.value) {
    form.clearErrors().put(`/tags/${currentTag.value.id}`, {
      preserveScroll: true,
      onSuccess: () => hide(),
    })
  }
}
</script>

<template>
  <ActionDialog :is-open="isOpen" :hide="hide">
    <template #body>
      <form @submit.prevent="renameTag">
        <div>
          <p class="-mt-3 text-center text-gray-500 sm:-mt-5">Enter a new name for your tag</p>

          <div class="mt-3 text-center sm:mt-5">
            <label for="tagName" class="sr-only">Tag name</label>

            <BaseTextInput
              id="tagName"
              ref="input"
              v-model="form.name"
              type="text"
              class="block w-full"
              placeholder="Enter a name for your tag"
            />

            <p v-if="form.errors.name" class="mt-2 text-left text-xs font-semibold text-red-500">
              {{ form.errors.name }}
            </p>
          </div>

          <!-- TODO: We're skipping the actions slot here because it's easier to wrap everything in a form this way. Is there a better way? -->
          <div
            class="mt-6 flex flex-col-reverse items-center justify-center space-y-3 space-y-reverse sm:flex-row sm:space-y-0 sm:space-x-3"
          >
            <BaseButton class="w-full" @click="hide">Cancel</BaseButton>

            <BaseButton button-type="submit" kind="primary" class="w-full" :disabled="form.processing">
              Save tag</BaseButton
            >
          </div>
        </div>
      </form>
    </template>
  </ActionDialog>
</template>
