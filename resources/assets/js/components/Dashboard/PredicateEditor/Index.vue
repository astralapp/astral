<template>
  <div>
    <div v-for="(group, i) in filter.groups" :key="`group-${i}`" class="py-8 border-b border-grey-light">
      <SelectDropdown v-model="group.logicalType" class="w-auto">
        <option value="any">Any</option>
        <option value="all">All</option>
        <option value="none">None</option>
      </SelectDropdown>
      <div v-for="(predicate, j) in group.predicates" :key="`group-${i}-predicate-${j}`" class="flex items-center mt-4">
        <SelectDropdown
          v-model="predicate.selectedTarget"
          style="width:150px;"
          @change="setDefaultArgumentValue(predicate)"
        >
          <option
            v-for="(target, k) in predicateTargets"
            :key="`group-${i}-predicate-${j}-target-${k}`"
            :value="target.key"
            >{{ target.label }}</option
          >
        </SelectDropdown>
        <SelectDropdown
          :value="currentOperator(predicate)"
          class="ml-4"
          style="width:165px;"
          @change="predicate.operator = $event"
        >
          <option
            v-for="operator in selectedPredicateTarget(predicate).operators"
            :key="operator.key"
            :value="operator.key"
            >{{ operator.label }}</option
          >
        </SelectDropdown>
        <component :is="`${selectedPredicateTarget(predicate).type}Filter`" v-model="predicate.argument" />
        <button
          class="relative nudge-t ml-4 inline-flex justify-center items-center flex-no-shrink rounded-full w-8 h-8 border-2 border-grey hover:border-grey-dark shadow text-grey-darker"
          @click="appendRow(i)"
        >
          <Icon type="PlusIcon" height="16" width="16" class="stroke-current fill-none" />
        </button>
        <button
          class="relative nudge-t ml-2 inline-flex justify-center items-center flex-no-shrink rounded-full w-8 h-8 border-2 border-grey hover:border-grey-dark shadow text-grey-darker"
          :disabled="group.predicates.length === 1"
          @click="removeRow(i, j)"
        >
          <Icon type="MinusIcon" height="16" width="16" class="stroke-current fill-none" />
        </button>
      </div>
      <button v-if="filter.groups.length > 1" class="btn btn-grey mt-8" @click="removeGroup(i)">Remove Group</button>
    </div>
    <button class="btn btn-grey mt-8" @click="appendGroup">Add Group</button>
  </div>
</template>
<script>
import Icon from '@/components/Icon'
import SelectDropdown from '@/components/SelectDropdown'
import NumberFilter from '@/components/Dashboard/PredicateEditor/NumberFilter'
import StringFilter from '@/components/Dashboard/PredicateEditor/StringFilter'
import TagsFilter from '@/components/Dashboard/PredicateEditor/TagsFilter'
import LanguageFilter from '@/components/Dashboard/PredicateEditor/LanguageFilter'
import StateFilter from '@/components/Dashboard/PredicateEditor/StateFilter'
import { cloneDeep } from 'lodash'
import { defaultPredicate, defaultGroup, predicateTargets } from '@/utils/predicates'
export default {
  components: {
    Icon,
    NumberFilter,
    StringFilter,
    TagsFilter,
    LanguageFilter,
    StateFilter,
    SelectDropdown
  },
  props: {
    value: String
  },
  data() {
    return {
      filter: {},
      predicateTargets
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
  created() {
    this.filter = JSON.parse(this.value)
  },
  methods: {
    appendRow(groupIndex) {
      this.filter.groups[groupIndex].predicates.push(cloneDeep(defaultPredicate))
    },
    removeRow(groupIndex, predicateIndex) {
      this.filter.groups[groupIndex].predicates.splice(predicateIndex, 1)
    },
    appendGroup() {
      this.filter.groups.push(defaultGroup)
    },
    removeGroup(index) {
      this.filter.groups.splice(index, 1)
    },
    selectedPredicateTarget(predicate) {
      return this.predicateTargets.find(target => target.key === predicate.selectedTarget)
    },
    currentOperator(predicate) {
      if (
        this.selectedPredicateTarget(predicate)
          .operators.map(o => o.key)
          .includes(predicate.operator)
      ) {
        return predicate.operator
      } else {
        const operator = this.selectedPredicateTarget(predicate).operators[0].key
        predicate.operator = operator
        return operator
      }
    },
    setDefaultArgumentValue(predicate) {
      if (this.selectedPredicateTarget(predicate).hasOwnProperty('defaultValue')) {
        predicate.argument = this.selectedPredicateTarget(predicate).defaultValue
      }
    }
  }
}
</script>
