<script lang="ts" setup>
import { ExclamationIcon } from '@heroicons/vue/outline'
import { useConfirm } from '@/scripts/composables/useConfirm'
import ActionDialog from '@/views/components/shared/core/ActionDialog.vue'
import BaseButton from '@/views/components/shared/core/BaseButton.vue'

const { confirmConfig } = useConfirm()
</script>

<template>
  <ActionDialog
    :is-open="confirmConfig.isOpen"
    :hide="confirmConfig.cancel"
    dialog-classes="sm:max-w-md px-4 pt-5 pb-4 sm:p-6"
    wrapper-classes="items-end"
  >
    <template #icon>
      <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
        <ExclamationIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
      </div>
    </template>

    <template #body>
      <p class="leading-normal text-gray-500">
        {{ confirmConfig.message }}
      </p>
    </template>

    <template #actions>
      <BaseButton variant="base" class="w-full" @click="confirmConfig.cancel">
        {{ confirmConfig.cancelLabel }}
      </BaseButton>

      <BaseButton kind="danger" class="w-full" @click="confirmConfig.confirm">
        {{ confirmConfig.confirmLabel }}
      </BaseButton>
    </template>
  </ActionDialog>
</template>
