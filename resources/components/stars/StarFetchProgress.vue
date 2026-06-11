<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    fetchedCount: number
    totalRepos: number
    label?: string
    variant?: 'default' | 'onDark'
  }>(),
  {
    label: 'Fetching stars…',
    variant: 'default',
  }
)

// How much of the bar is still empty, as a percentage; the fill is translated left by this amount.
const remaining = computed(() => {
  if (props.totalRepos <= 0) return 100

  return Math.max(0, 100 - (props.fetchedCount / props.totalRepos) * 100)
})
</script>

<template>
  <div class="w-full">
    <p
      class="animate-pulse text-lg font-bold"
      :class="variant === 'onDark' ? 'text-white' : 'text-gray-700 dark:text-gray-200'"
    >
      {{ label }}
    </p>

    <div class="mt-4 flex w-full items-center gap-x-4">
      <div
        role="progressbar"
        :aria-valuenow="fetchedCount"
        :aria-valuemin="0"
        :aria-valuemax="totalRepos"
        class="h-8 w-full overflow-hidden rounded-full ring-2 ring-inset transform-[translateZ(0)]"
        :class="
          variant === 'onDark'
            ? 'bg-gray-900 ring-white'
            : 'bg-gray-100 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700'
        "
      >
        <div
          class="relative h-full w-full rounded-full transition-[translate] duration-660 ease-[cubic-bezier(0.65,0,0.35,1)]"
          :class="variant === 'onDark' ? 'bg-white' : 'bg-brand-500'"
          :style="{ translate: `-${remaining}% 0%` }"
        ></div>
      </div>

      <p
        v-if="totalRepos > 0"
        class="shrink-0 font-semibold tabular-nums"
        :class="variant === 'onDark' ? 'text-white' : 'text-gray-600 dark:text-gray-300'"
      >
        {{ fetchedCount }} / {{ totalRepos }}
      </p>
    </div>
  </div>
</template>
