<script setup lang="ts">
import DateFilter from '@/components/smart-filter-editor/filters/DateFilter.vue'
import LanguageFilter from '@/components/smart-filter-editor/filters/LanguageFilter.vue'
import NumberFilter from '@/components/smart-filter-editor/filters/NumberFilter.vue'
import StateFilter from '@/components/smart-filter-editor/filters/StateFilter.vue'
import StringFilter from '@/components/smart-filter-editor/filters/StringFilter.vue'
import TagsFilter from '@/components/smart-filter-editor/filters/TagsFilter.vue'
import TopicsFilter from '@/components/smart-filter-editor/filters/TopicsFilter.vue'
import FilterSelect from '@/components/smart-filter-editor/FilterSelect.vue'
import MatchTypeToggle from '@/components/smart-filter-editor/MatchTypeToggle.vue'
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
import { defineComponent, reactive, watch } from 'vue'

const props = defineProps<{ modelValue: string }>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'update:modelValue', value: string): void
}>()

const predicateTargetFilters: Record<PredicateTargetType, ReturnType<typeof defineComponent>> = {
  Date: DateFilter,
  Language: LanguageFilter,
  Number: NumberFilter,
  State: StateFilter,
  String: StringFilter,
  Tags: TagsFilter,
  Topics: TopicsFilter,
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
  emit('add')
}

const removeRow = (groupIndex: number, predicateIndex: number): void => {
  filterBody.groups[groupIndex].predicates.splice(predicateIndex, 1)
}

const appendGroup = (): void => {
  filterBody.groups.push(createDefaultGroup())
  emit('add')
}

const removeGroup = (index: number): void => {
  filterBody.groups.splice(index, 1)
}
</script>

<template>
  <div class="space-y-3">
    <template
      v-for="(group, i) in filterBody.groups"
      :key="`group-${i}`"
    >
      <div
        v-if="i > 0"
        class="flex items-center gap-3 px-1"
        aria-hidden="true"
      >
        <span class="h-px flex-1 bg-gray-200 dark:bg-gray-800" />

        <span class="text-xxs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-600">and</span>

        <span class="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
      </div>

      <section
        class="rounded-lg border border-gray-200 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-950/40 sm:p-4"
        :aria-label="`Filter group ${i + 1}`"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-gray-500 dark:text-gray-400">
            <span>Match</span>

            <MatchTypeToggle v-model="group.logicalType" />

            <span>of the following</span>
          </div>

          <button
            v-if="filterBody.groups.length > 1"
            type="button"
            class="-mr-1 inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-200 dark:text-gray-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 dark:focus-visible:ring-red-500/30"
            aria-label="Remove group"
            @click="removeGroup(i)"
          >
            <i-lucide-trash-2
              class="h-4 w-4"
              role="presentation"
            />
          </button>
        </div>

        <div class="mt-3 space-y-2">
          <div
            v-for="(predicate, j) in group.predicates"
            :key="`group-${i}-predicate-${j}`"
            class="flex items-start gap-2"
          >
            <div class="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[10rem_10rem_minmax(0,1fr)] sm:items-start">
              <FilterSelect
                :model-value="predicate.selectedTarget"
                aria-label="Field"
                @update:model-value="setPredicateTarget(predicate, $event)"
              >
                <option
                  v-for="target in predicateTargets"
                  :key="`group-${i}-predicate-${j}-target-${target.keyPath}`"
                  :value="target.keyPath"
                >
                  {{ target.label }}
                </option>
              </FilterSelect>

              <FilterSelect
                v-model="predicate.operator"
                aria-label="Condition"
              >
                <option
                  v-for="operator in getOperatorsForPredicate(predicate)"
                  :key="operator.key"
                  :value="operator.key"
                >
                  {{ operator.label }}
                </option>
              </FilterSelect>

              <component
                :is="predicateTargetFilters[getPredicateTarget(predicate.selectedTarget).type]"
                v-model="predicate.argument"
                class="w-full"
              />
            </div>

            <button
              v-if="group.predicates.length > 1"
              type="button"
              class="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-200 dark:text-gray-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 dark:focus-visible:ring-red-500/30"
              aria-label="Remove condition"
              @click="removeRow(i, j)"
            >
              <i-lucide-x
                class="h-4 w-4"
                role="presentation"
              />
            </button>
          </div>
        </div>

        <button
          type="button"
          class="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-500 transition hover:bg-gray-200/60 hover:text-gray-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-300 dark:text-gray-400 dark:hover:bg-gray-800/70 dark:hover:text-gray-200 dark:focus-visible:ring-gray-600"
          @click="appendRow(i)"
        >
          <i-lucide-plus
            class="h-4 w-4"
            role="presentation"
          />

          <span>Add condition</span>
        </button>
      </section>
    </template>

    <button
      type="button"
      class="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-500 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800/40 dark:hover:text-gray-200 dark:focus-visible:ring-gray-600"
      @click="appendGroup"
    >
      <i-lucide-plus
        class="h-4 w-4"
        role="presentation"
      />

      <span>Add group</span>
    </button>
  </div>
</template>
