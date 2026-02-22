<script setup lang="ts">
import BaseButton from '@/components/shared/core/BaseButton.vue'
import BaseSelect from '@/components/shared/core/BaseSelect.vue'
import DateFilter from '@/components/smart-filter-editor/filters/DateFilter.vue'
import LanguageFilter from '@/components/smart-filter-editor/filters/LanguageFilter.vue'
import NumberFilter from '@/components/smart-filter-editor/filters/NumberFilter.vue'
import StateFilter from '@/components/smart-filter-editor/filters/StateFilter.vue'
import StringFilter from '@/components/smart-filter-editor/filters/StringFilter.vue'
import TagsFilter from '@/components/smart-filter-editor/filters/TagsFilter.vue'
import {
  applyPredicateTarget,
  createDefaultFilterBody,
  createDefaultGroup,
  createDefaultPredicate,
  getOperatorsForPredicate,
  getPredicateTarget,
  parseSmartFilterBody,
  Predicate,
  PredicateTargetType,
  predicateTargets,
  SmartFilterBody,
  stringifySmartFilterBody,
} from '@/utils/predicates'
import { MinusCircleIcon } from '@heroicons/vue/16/solid'
import { MinusIcon, PlusIcon } from '@heroicons/vue/24/solid'
import { defineComponent, reactive, watch } from 'vue'

const props = defineProps<{ modelValue: string }>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const predicateTargetFilters: Record<PredicateTargetType, ReturnType<typeof defineComponent>> = {
  Date: DateFilter,
  Language: LanguageFilter,
  Number: NumberFilter,
  State: StateFilter,
  String: StringFilter,
  Tags: TagsFilter,
}

const filterBody = reactive<SmartFilterBody>(createDefaultFilterBody())

const setPredicateTarget = (predicate: Predicate, selectedTarget: string): void => {
  applyPredicateTarget(predicate, selectedTarget)
}

let isUpdatingFromModel = false

watch(
  () => props.modelValue,
  value => {
    isUpdatingFromModel = true
    filterBody.groups = parseSmartFilterBody(value).groups
    isUpdatingFromModel = false
  },
  { immediate: true }
)

watch(
  filterBody,
  filter => {
    if (isUpdatingFromModel) {
      return
    }

    const serializedFilter = stringifySmartFilterBody(filter)

    if (serializedFilter !== props.modelValue) {
      emit('update:modelValue', serializedFilter)
    }
  },
  { deep: true }
)

const appendRow = (groupIndex: number): void => {
  filterBody.groups[groupIndex].predicates.push(createDefaultPredicate())
}

const removeRow = (groupIndex: number, predicateIndex: number): void => {
  filterBody.groups[groupIndex].predicates.splice(predicateIndex, 1)
}

const appendGroup = (): void => {
  filterBody.groups.push(createDefaultGroup())
}

const removeGroup = (index: number): void => {
  filterBody.groups.splice(index, 1)
}
</script>

<template>
  <div>
    <div
      v-for="(group, i) in filterBody.groups"
      :key="`group-${i}`"
      class="group border-b border-gray-200 dark:border-gray-700 py-8"
    >
      <div class="flex items-center">
        <BaseSelect
          v-model="group.logicalType"
          class="w-auto"
        >
          <option value="any">Any</option>

          <option value="all">All</option>

          <option value="none">None</option>
        </BaseSelect>

        <BaseButton
          v-if="filterBody.groups.length > 1"
          class="btn btn-grey ml-auto space-x-1 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100 dark:hover:bg-red-500/10"
          kind="danger-borderless"
          size="sm"
          @click="removeGroup(i)"
        >
          <MinusCircleIcon
            class="h-4 w-4"
            aria-hidden="true"
          />

          <span>Remove group</span></BaseButton
        >
      </div>

      <div
        v-for="(predicate, j) in group.predicates"
        :key="`group-${i}-predicate-${j}`"
        class="mt-4 flex w-full items-center"
      >
        <div class="flex w-full items-center space-x-2">
          <BaseSelect
            :model-value="predicate.selectedTarget"
            @update:model-value="setPredicateTarget(predicate, $event)"
          >
            <option
              v-for="target in predicateTargets"
              :key="`group-${i}-predicate-${j}-target-${target.keyPath}`"
              :value="target.keyPath"
            >
              {{ target.label }}
            </option>
          </BaseSelect>

          <BaseSelect
            v-model="predicate.operator"
            class="ml-4"
          >
            <option
              v-for="operator in getOperatorsForPredicate(predicate)"
              :key="operator.key"
              :value="operator.key"
            >
              {{ operator.label }}
            </option>
          </BaseSelect>

          <component
            :is="predicateTargetFilters[getPredicateTarget(predicate.selectedTarget).type]"
            v-model="predicate.argument"
          />
        </div>

        <div class="ml-auto flex-shrink-0 space-x-2 pl-2">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-400 bg-gray-100 text-lg font-semibold text-gray-400 shadow-md transition-colors hover:border-gray-500 hover:text-gray-500 active:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300 dark:active:bg-gray-800"
            aria-label="Add row"
            @click="appendRow(i)"
          >
            <PlusIcon class="h-5 w-5" />
          </button>

          <button
            v-if="group.predicates.length > 1"
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-400 bg-gray-100 text-lg font-semibold text-gray-400 shadow-md transition-colors hover:border-gray-500 hover:text-gray-500 active:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300 dark:active:bg-gray-800"
            aria-label="Remove row"
            @click="removeRow(i, j)"
          >
            <MinusIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <BaseButton
        class="space-x-1 hover:bg-brand-50 dark:hover:bg-brand-500/10"
        kind="primary-borderless"
        @click="appendGroup"
      >
        <PlusIcon
          class="h-5 w-5"
          aria-hidden="true"
        />

        <span>Add group</span>
      </BaseButton>
    </div>
  </div>
</template>
