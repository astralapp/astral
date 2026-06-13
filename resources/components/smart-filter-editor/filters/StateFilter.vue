<script setup lang="ts">
import FilterSelect from '@/components/smart-filter-editor/FilterSelect.vue'

interface StateOption {
  key: 'node.isArchived'
  label: 'archived'
}

interface Props {
  modelValue?: Maybe<StateOption>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Maybe<StateOption>): void
}>()

const stateOptions: StateOption[] = [{ key: 'node.isArchived', label: 'archived' }]

const updateState = (selectedKey: string): void => {
  const selectedState = stateOptions.find(state => state.key === selectedKey) ?? stateOptions[0]

  emit('update:modelValue', selectedState)
}
</script>

<template>
  <FilterSelect
    :model-value="props.modelValue?.key ?? stateOptions[0].key"
    class="w-full"
    aria-label="State"
    @update:model-value="updateState"
  >
    <option
      v-for="state in stateOptions"
      :key="state.key"
      :value="state.key"
    >
      {{ state.label }}
    </option>
  </FilterSelect>
</template>
