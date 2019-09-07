<template>
  <SelectDropdown :value="value.key" class="flex-grow ml-4" style="width:165px;" @change="$emit('change', value)">
    <option v-for="state in stateOptions" :key="state.key" :value="state.key">{{ state.label }}</option>
  </SelectDropdown>
</template>

<script>
import SelectDropdown from '@/components/SelectDropdown'
export default {
  components: {
    SelectDropdown
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: Object
  },
  data() {
    return {
      stateOptions: [{ key: 'node.isArchived', label: 'archived' }]
    }
  }
}
</script>

<style></style>
