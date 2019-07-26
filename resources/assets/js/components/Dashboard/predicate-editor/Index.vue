<template>
  <div>
    <div v-for="(group, i) in filter.groups" :key="`group-${i}`">
      <SelectDropdown v-model="group.logicalType" class="w-auto">
        <option value="any">Any</option>
        <option value="all">All</option>
        <option value="none">None</option>
      </SelectDropdown>
      <div v-for="(predicate, j) in group.predicates" :key="`group-${i}-predicate-${j}`" class="flex items-center mt-4">
        <SelectDropdown v-model="predicate.selectedTarget" style="width:250px;">
          <option
            v-for="(target, k) in predicate.targets"
            :key="`group-${i}-predicate-${j}-target-${k}`"
            :value="target.key"
            >{{ target.label }}</option
          >
        </SelectDropdown>
        <SelectDropdown v-model="predicate.operator" class="ml-4" style="width:145px;">
          <option value="is">is</option>
          <option value="contains">contains</option>
          <option value="isnt">isn't</option>
        </SelectDropdown>
        <input v-model="predicate.argument" type="text" placeholder="" class="text-input text-sm px-2 w-64 ml-4" />
        <button
          class="ml-4 inline-flex justify-center items-center flex-no-shrink rounded-full w-8 h-8 border-2 border-grey hover:border-grey-dark shadow text-grey-darker"
          @click="appendRow(i)"
        >
          <Icon type="PlusIcon" height="16" width="16" class="stroke-current fill-none" />
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import Icon from '@/components/Icon'
import SelectDropdown from '@/components/SelectDropdown'
export default {
  components: {
    Icon,
    SelectDropdown
  },
  props: {
    value: String
  },
  data() {
    return {
      filter: {}
    }
  },
  watch: {
    filter: {
      handler(newVal) {
        this.$emit('input', JSON.stringify(newVal))
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.filter = JSON.parse(this.value)
  },
  methods: {
    appendRow(groupIndex) {
      this.filter.groups[groupIndex].predicates.push({
        targets: [
          { label: 'Repository Name', key: 'nameWithOwner' },
          { label: 'Repository Description', key: 'description' }
        ],
        selectedTarget: 'nameWithOwner',
        operator: 'is',
        argument: ''
      })
    }
  }
}
</script>
