<script setup lang="ts">
import { PredicateOperator } from '@/utils/predicates'
import BaseSelect from '@/components/shared/core/BaseSelect.vue'

interface Props {
  modelValue?: Maybe<PredicateOperator>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Maybe<string>): void
}>()

const stateOptions = [{ key: 'node.isArchived', label: 'archived' }]
</script>

<template>
  <BaseSelect
    :model-value="modelValue?.key"
    class="w-auto"
    @change="$emit('update:modelValue', modelValue?.key)"
  >
    <option
      v-for="state in stateOptions"
      :key="state.key"
      :value="state.key"
    >
      {{ state.label }}
    </option>
  </BaseSelect>
</template>
