<script lang="ts" setup>
import BaseButton from '@/components/shared/core/BaseButton.vue'
import BaseDialog from '@/components/shared/core/BaseDialog.vue'
import { ref, watch } from 'vue'

interface Props {
  hide: () => void
  isOpen: boolean
}

const props = defineProps<Props>()

const isOpen = ref(props.isOpen)

watch(
  () => props.isOpen,
  newVal => {
    isOpen.value = newVal
  }
)

const noop = () => {} // eslint-disable-line @typescript-eslint/no-empty-function
</script>

<template>
  <BaseDialog
    :is-open="isOpen"
    :hide="noop"
    dialog-classes="px-4 pt-5 pb-4 sm:p-6 sm:max-w-3xl"
  >
    <div>
      <p>Welcum!!!!!!!!!!!!!!!!!! 🎉🎉🎉🎉🎉</p>
    </div>
  </BaseDialog>
</template>
