<script setup lang="ts">
import BaseTextInput from '@/components/shared/core/BaseTextInput.vue'
import WatchValue from '@/components/shared/core/WatchValue.vue'
import { Popover, PopoverButton, PopoverPanel, Portal } from '@headlessui/vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/16/solid'
import * as dateFns from 'date-fns'
import { computed, nextTick, reactive, ref } from 'vue'

interface DateWithMeta {
  date: Date
  isCurrentMonth: boolean
  isSelected: boolean
  isToday: boolean
}

type PickerView = 'day' | 'month' | 'year'

const modelValue = defineModel<string>('modelValue', { default: '' })

// GitHub launched in 2008, so there are no stars to match before then.
const MIN_YEAR = 2008
const DAY_LABELS = ['S', 'M', 'T', 'W', 'Th', 'F', 'S']
const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const MONTH_LABELS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// The selected field can change under us (e.g. Tags → Updated at), so the
// incoming value isn't guaranteed to be a `yyyy-MM-dd` string. Coerce anything
// unparseable to today rather than letting date-fns format an invalid date and
// throw mid-render.
const toValidDate = (value: unknown): Date => {
  if (typeof value === 'string' && value) {
    const parsed = dateFns.parse(value, 'yyyy-MM-dd', new Date())

    if (dateFns.isValid(parsed)) {
      return parsed
    }
  }

  return new Date()
}

const today = ref(new Date())
const maxYear = today.value.getFullYear()

const clampYear = (year: number) => Math.min(maxYear, Math.max(MIN_YEAR, year))

// The cursor only ever drives the visible month grid, so pin it to the first of
// the month: that keeps `setMonth` / `setYear` from rolling over on a 31st.
const toCursor = (date: Date) => dateFns.startOfMonth(dateFns.setYear(date, clampYear(date.getFullYear())))

const selectedDate = ref(toValidDate(modelValue.value))

// Normalize the stored value so the field shows (and saves) a real date the
// moment it becomes a date filter, instead of an empty or carried-over value.
const normalizedValue = dateFns.format(selectedDate.value, 'yyyy-MM-dd')
if (modelValue.value !== normalizedValue) {
  modelValue.value = normalizedValue
}

const isDatePickerShowing = ref(false)
const view = ref<PickerView>('day')
const inputRef = ref<null | typeof BaseTextInput>(null)
const inputRect = reactive<Pick<Record<keyof DOMRect, number>, 'height' | 'left' | 'top'>>({
  height: 38,
  left: 0,
  top: 0,
})

const dateCursor = ref(toCursor(selectedDate.value))

const currentMonth = computed(() => dateCursor.value.getMonth())
const currentMonthLabel = computed(() => MONTH_LABELS[currentMonth.value])
const currentYear = computed(() => dateCursor.value.getFullYear())

const years = computed(() => {
  const list: number[] = []

  for (let year = maxYear; year >= MIN_YEAR; year--) {
    list.push(year)
  }

  return list
})

const canGoPrevMonth = computed(() => !(currentYear.value === MIN_YEAR && currentMonth.value === 0))
const canGoNextMonth = computed(() => !(currentYear.value === maxYear && currentMonth.value === 11))
const canGoPrevYear = computed(() => currentYear.value > MIN_YEAR)
const canGoNextYear = computed(() => currentYear.value < maxYear)

const dates = computed(() => {
  const cursor = dateCursor.value
  let startDate = dateFns.startOfMonth(cursor)
  let endDate = dateFns.endOfMonth(cursor)
  const leadPaddingDays = dateFns.getDay(startDate)
  const trailingPaddingDays = 6 - dateFns.getDay(endDate)

  startDate = dateFns.addDays(startDate, -leadPaddingDays)
  endDate = dateFns.addDays(endDate, trailingPaddingDays)

  return dateFns.eachDayOfInterval({ end: endDate, start: startDate }).map(
    date =>
      ({
        date,
        isCurrentMonth: dateFns.isSameMonth(cursor, date),
        isSelected: dateFns.isSameDay(date, selectedDate.value),
        isToday: dateFns.isSameDay(date, today.value),
      } as DateWithMeta)
  )
})

const formatDateToDay = (date: Date) => dateFns.format(date, 'd')

const setSelectedDate = (day: DateWithMeta) => {
  selectedDate.value = day.date
  modelValue.value = dateFns.format(selectedDate.value, 'yyyy-MM-dd')
  dateCursor.value = dateFns.startOfMonth(day.date)
  isDatePickerShowing.value = false
}

const previousMonth = () => {
  if (canGoPrevMonth.value) {
    dateCursor.value = dateFns.subMonths(dateCursor.value, 1)
  }
}

const nextMonth = () => {
  if (canGoNextMonth.value) {
    dateCursor.value = dateFns.addMonths(dateCursor.value, 1)
  }
}

const previousYear = () => {
  if (canGoPrevYear.value) {
    dateCursor.value = dateFns.subYears(dateCursor.value, 1)
  }
}

const nextYear = () => {
  if (canGoNextYear.value) {
    dateCursor.value = dateFns.addYears(dateCursor.value, 1)
  }
}

const selectMonth = (monthIndex: number) => {
  dateCursor.value = dateFns.setMonth(dateCursor.value, monthIndex)
  view.value = 'day'
}

const selectYear = (year: number) => {
  dateCursor.value = dateFns.setYear(dateCursor.value, clampYear(year))
  view.value = 'day'
}

const showDatepicker = async () => {
  const rect = inputRef.value?.$el.getBoundingClientRect()
  inputRect.top = rect?.top || 0
  inputRect.left = rect?.left || 0

  view.value = 'day'
  dateCursor.value = toCursor(selectedDate.value)

  await nextTick()

  isDatePickerShowing.value = true
}

const hideDatepicker = async () => {
  isDatePickerShowing.value = false

  await nextTick()

  inputRef.value?.$el.focus()
}

const setDatePickerVisibility = (isVisible: boolean) => {
  if (isVisible) {
    showDatepicker()
  } else {
    hideDatepicker()
  }
}
</script>

<template>
  <Popover
    v-slot="{ open }"
    class="relative"
  >
    <WatchValue
      :value="open"
      @change="setDatePickerVisibility($event)"
    />

    <div class="relative">
      <BaseTextInput
        ref="inputRef"
        :model-value="dateFns.format(selectedDate, 'yyyy-MM-dd')"
        class="w-full grow"
        :class="{ 'border-gray-400 ring-gray-400 dark:ring-gray-600': open && isDatePickerShowing }"
        readonly
      />

      <PopoverButton
        v-show="!isDatePickerShowing && !open"
        class="absolute inset-0 z-10 cursor-text"
        aria-label="Show Datepicker"
      ></PopoverButton>
    </div>

    <Portal as="template">
      <div v-show="isDatePickerShowing && open">
        <PopoverPanel
          static
          class="absolute z-10 -mt-2 w-64 -translate-y-full rounded-md border border-gray-200 bg-white p-3 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-900"
          :style="{
            left: inputRect.left + 'px',
            top: inputRect.top + 'px',
          }"
        >
          <!-- Day grid -->
          <div v-if="view === 'day'">
            <header class="mb-2 flex items-center justify-between gap-1">
              <button
                type="button"
                aria-label="Previous month"
                :disabled="!canGoPrevMonth"
                class="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200 disabled:pointer-events-none disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 dark:focus-visible:ring-brand-500/30"
                @click="previousMonth"
              >
                <ChevronLeftIcon class="h-4 w-4" />
              </button>

              <div class="flex items-center gap-0.5">
                <button
                  type="button"
                  class="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:ring-brand-500/30"
                  @click="view = 'month'"
                >
                  {{ currentMonthLabel }}
                </button>

                <button
                  type="button"
                  class="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:ring-brand-500/30"
                  @click="view = 'year'"
                >
                  {{ currentYear }}
                </button>
              </div>

              <button
                type="button"
                aria-label="Next month"
                :disabled="!canGoNextMonth"
                class="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200 disabled:pointer-events-none disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 dark:focus-visible:ring-brand-500/30"
                @click="nextMonth"
              >
                <ChevronRightIcon class="h-4 w-4" />
              </button>
            </header>

            <div class="grid grid-cols-7">
              <div
                v-for="dayLabel in DAY_LABELS"
                :key="dayLabel"
                class="flex h-7 items-center justify-center font-semibold text-gray-400 dark:text-gray-500"
              >
                {{ dayLabel }}
              </div>

              <PopoverButton
                v-for="(day, index) in dates"
                :key="index"
                type="button"
                class="flex aspect-square cursor-pointer items-center justify-center rounded-md transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-500/30"
                :class="
                  day.isSelected
                    ? 'bg-brand-100 font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
                    : day.isToday
                    ? 'font-semibold text-brand-600 hover:bg-gray-100 dark:text-brand-400 dark:hover:bg-gray-800'
                    : day.isCurrentMonth
                    ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    : 'text-gray-300 hover:bg-gray-100 dark:text-gray-600 dark:hover:bg-gray-800'
                "
                @click="setSelectedDate(day)"
              >
                {{ formatDateToDay(day.date) }}
              </PopoverButton>
            </div>
          </div>

          <!-- Month picker -->
          <div v-else-if="view === 'month'">
            <header class="mb-2 flex items-center justify-between gap-1">
              <button
                type="button"
                aria-label="Previous year"
                :disabled="!canGoPrevYear"
                class="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200 disabled:pointer-events-none disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 dark:focus-visible:ring-brand-500/30"
                @click="previousYear"
              >
                <ChevronLeftIcon class="h-4 w-4" />
              </button>

              <button
                type="button"
                class="cursor-pointer rounded-md px-2 py-1 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:ring-brand-500/30"
                @click="view = 'year'"
              >
                {{ currentYear }}
              </button>

              <button
                type="button"
                aria-label="Next year"
                :disabled="!canGoNextYear"
                class="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200 disabled:pointer-events-none disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 dark:focus-visible:ring-brand-500/30"
                @click="nextYear"
              >
                <ChevronRightIcon class="h-4 w-4" />
              </button>
            </header>

            <div class="grid grid-cols-3 gap-1">
              <button
                v-for="(label, index) in MONTH_LABELS_SHORT"
                :key="label"
                type="button"
                class="cursor-pointer rounded-md py-2 text-center transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-500/30"
                :class="
                  index === currentMonth
                    ? 'bg-brand-100 font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                "
                @click="selectMonth(index)"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <!-- Year picker -->
          <div v-else>
            <header class="mb-2 flex h-7 items-center justify-center">
              <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {{ years[years.length - 1] }}–{{ years[0] }}
              </span>
            </header>

            <div class="grid max-h-44 grid-cols-3 gap-1 overflow-y-auto">
              <button
                v-for="year in years"
                :key="year"
                type="button"
                class="cursor-pointer rounded-md py-2 text-center transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-200 dark:focus-visible:ring-brand-500/30"
                :class="
                  year === currentYear
                    ? 'bg-brand-100 font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                "
                @click="selectYear(year)"
              >
                {{ year }}
              </button>
            </div>
          </div>
        </PopoverPanel>
      </div>
    </Portal>
  </Popover>
</template>
