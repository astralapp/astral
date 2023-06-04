<script lang="ts" setup>
import { ref, watch } from 'vue'
import BaseDialog from '@/views/components/shared/core/BaseDialog.vue'
import BaseButton from '@/views/components/shared/core/BaseButton.vue'

interface Props {
  isOpen: boolean
  hide: () => void
}

const props = defineProps<Props>()

const isOpen = ref(props.isOpen)

watch(
  () => props.isOpen,
  newVal => {
    isOpen.value = newVal
  }
)

const noop = () => {}
</script>

<template>
  <BaseDialog :is-open="isOpen" :hide="noop" dialog-classes="px-4 pt-5 pb-4 sm:p-6 sm:max-w-3xl">
    <div>
      <p>Welcum!!!!!!!!!!!!!!!!!! 🎉🎉🎉🎉🎉</p>
    </div>
  </BaseDialog>
</template>
