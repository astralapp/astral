<script setup lang="ts">
import { reactive, watch, defineComponent } from 'vue'
import BaseSelect from '@/views/components/shared/core/BaseSelect.vue'
import BaseButton from '@/views/components/shared/core/BaseButton.vue'
import StringFilter from '@/views/components/smart-filter-editor/filters/StringFilter.vue'
import NumberFilter from '@/views/components/smart-filter-editor/filters/NumberFilter.vue'
import StateFilter from '@/views/components/smart-filter-editor/filters/StateFilter.vue'
import TagsFilter from '@/views/components/smart-filter-editor/filters/TagsFilter.vue'
import LanguageFilter from '@/views/components/smart-filter-editor/filters/LanguageFilter.vue'
import DateFilter from '@/views/components/smart-filter-editor/filters/DateFilter.vue'
import cloneDeep from 'lodash/cloneDeep'
import { PlusIcon, MinusIcon, MinusCircleIcon } from '@heroicons/vue/solid'
import {
  predicateTargets,
  PredicateGroup,
  Predicate,
  defaultPredicate,
  defaultGroup,
  PredicateTargetType,
} from '@/scripts/utils/predicates'

const props = defineProps<{ modelValue: string }>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const predicateTargetFilters: Record<PredicateTargetType, ReturnType<typeof defineComponent>> = {
  String: StringFilter,
  Number: NumberFilter,
  State: StateFilter,
  Tags: TagsFilter,
  Language: LanguageFilter,
  Date: DateFilter,
}

const filterBody = reactive<Record<'groups', PredicateGroup[]>>({
  groups: [],
})

watch(
  () => props.modelValue,
  value => {
    Object.assign(filterBody, JSON.parse(value) as PredicateGroup[])
  },
  { immediate: true }
)

watch(
  filterBody,
  filter => {
    emit('update:modelValue', JSON.stringify(filter))
  },
  { deep: true }
)

const setPredicateOperator = (e: Event, predicate: Predicate) => {
  predicate.operator = (e.target as HTMLSelectElement).value
}

const selectedPredicateTarget = (predicate: Predicate) => {
  return predicateTargets.find(target => target.key === predicate.selectedTarget)
}

const setDefaultArgumentValue = (predicate: Predicate) => {
  const defaultValue = selectedPredicateTarget(predicate)?.defaultValue

  if (defaultValue !== undefined) {
    if (typeof defaultValue === 'function') {
      predicate.argument = defaultValue()
    } else {
      predicate.argument = defaultValue
    }
  }
}

const currentOperator = (predicate: Predicate) => {
  if (
    selectedPredicateTarget(predicate) &&
    selectedPredicateTarget(predicate)
      ?.operators.map(o => o.key)
      .includes(predicate.operator)
  ) {
    return predicate.operator
  } else {
    const operator = selectedPredicateTarget(predicate)?.operators[0].key

    if (operator) {
      predicate.operator = operator
    }

    return operator
  }
}

const appendRow = (i: number) => {
  filterBody.groups[i].predicates.push(cloneDeep(defaultPredicate))
}

const removeRow = (groupIndex: number, predicateIndex: number) => {
  filterBody.groups[groupIndex].predicates.splice(predicateIndex, 1)
}

const appendGroup = () => {
  filterBody.groups.push(defaultGroup)
}

const removeGroup = (index: number) => {
  filterBody.groups.splice(index, 1)
}
</script>

<template>
  <div>
    <div v-for="(group, i) in filterBody.groups" :key="`group-${i}`" class="group border-b border-gray-200 py-8">
      <div class="flex items-center">
        <BaseSelect v-model="group.logicalType" class="w-auto">
          <option value="any">Any</option>

          <option value="all">All</option>

          <option value="none">None</option>
        </BaseSelect>

        <BaseButton
          v-if="filterBody.groups.length > 1"
          class="btn btn-grey ml-auto space-x-1 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
          kind="danger-borderless"
          size="sm"
          @click="removeGroup(i)"
        >
          <MinusCircleIcon class="h-4 w-4" aria-hidden="true" />

          <span>Remove group</span></BaseButton
        >
      </div>

      <div
        v-for="(predicate, j) in group.predicates"
        :key="`group-${i}-predicate-${j}`"
        class="mt-4 flex w-full items-center"
      >
        <div class="flex w-full items-center space-x-2">
          <BaseSelect v-model="predicate.selectedTarget" @change="setDefaultArgumentValue(predicate)">
            <option
              v-for="(target, k) in predicateTargets"
              :key="`group-${i}-predicate-${j}-target-${k}`"
              :value="target.key"
            >
              {{ target.label }}
            </option>
          </BaseSelect>

          <BaseSelect
            :model-value="currentOperator(predicate)"
            class="ml-4"
            @change="setPredicateOperator($event, predicate)"
          >
            <option
              v-for="operator in selectedPredicateTarget(predicate)?.operators"
              :key="operator.key"
              :value="operator.key"
            >
              {{ operator.label }}
            </option>
          </BaseSelect>

          <component
            :is="predicateTargetFilters[selectedPredicateTarget(predicate)?.type || 'String']"
            v-if="selectedPredicateTarget(predicate)?.type"
            v-model="predicate.argument"
          />
        </div>

        <div class="ml-auto flex-shrink-0 space-x-2 pl-2">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-400 bg-gray-100 text-lg font-semibold text-gray-400 shadow-md transition-colors hover:border-gray-500 hover:text-gray-500 active:bg-gray-200"
            aria-label="Add row"
            @click="appendRow(i)"
          >
            <PlusIcon class="h-5 w-5" />
          </button>

          <button
            v-if="group.predicates.length > 1"
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-400 bg-gray-100 text-lg font-semibold text-gray-400 shadow-md transition-colors hover:border-gray-500 hover:text-gray-500 active:bg-gray-200"
            aria-label="Remove row"
            @click="removeRow(i, j)"
          >
            <MinusIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <BaseButton class="btn btn-grey space-x-1 hover:bg-brand-50" kind="primary-borderless" @click="appendGroup">
        <PlusIcon class="h-5 w-5" aria-hidden="true" />

        <span>Add group</span>
      </BaseButton>
    </div>
  </div>
</template>
