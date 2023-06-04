<script lang="ts" setup>
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { SwitchVerticalIcon } from '@heroicons/vue/solid'
import { FetchDirection, TagSortMethod } from '@/scripts/types'
import NameAZIcon from '@/views/components/shared/icons/tag-sorting/NameAZIcon.vue'
import NameZAIcon from '@/views/components/shared/icons/tag-sorting/NameZAIcon.vue'
import StarsCountHighIcon from '@/views/components/shared/icons/tag-sorting/StarsCountHighIcon.vue'
import StarsCountLowIcon from '@/views/components/shared/icons/tag-sorting/StarsCountLowIcon.vue'

const emit = defineEmits<{
  (e: 'sortTags', method: TagSortMethod, direction: Lowercase<FetchDirection>): void
}>()
</script>

<template>
  <Menu v-slot="{ open }" as="div" class="relative">
    <MenuButton
      class="inline-flex items-center text-gray-400 transition-colors hover:text-gray-200"
      :class="{ 'text-gray-50': open }"
    >
      <span class="text-xs uppercase tracking-wider">Sort</span>

      <SwitchVerticalIcon class="ml-1 h-4 w-4" aria-hidden="true" />
    </MenuButton>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-2 z-20 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:right-0"
      >
        <div class="py-1">
          <MenuItem v-slot="{ active }">
            <button
              type="button"
              class="group flex w-full items-center p-2 text-xs font-semibold"
              :class="[active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700']"
              @click="emit('sortTags', 'name', 'asc')"
            >
              <NameAZIcon class="mr-1 h-4 w-4 text-gray-400 group-hover:text-indigo-500" aria-hidden="true" />

              <span>Alphabetical (A-Z)</span>
            </button>
          </MenuItem>

          <MenuItem v-slot="{ active }">
            <button
              type="button"
              class="group flex w-full items-center p-2 text-xs font-semibold"
              :class="[active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700']"
              @click="emit('sortTags', 'name', 'desc')"
            >
              <NameZAIcon class="mr-1 h-4 w-4 text-gray-400 group-hover:text-indigo-500" aria-hidden="true" />

              <span>Alphabetical (Z-A)</span>
            </button>
          </MenuItem>

          <MenuItem v-slot="{ active }">
            <button
              type="button"
              class="group flex w-full items-center p-2 text-xs font-semibold"
              :class="[active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700']"
              @click="emit('sortTags', 'stars_count', 'desc')"
            >
              <StarsCountHighIcon class="mr-1 h-4 w-4 text-gray-400 group-hover:text-indigo-500" aria-hidden="true" />

              <span>Most Stars</span>
            </button>
          </MenuItem>

          <MenuItem v-slot="{ active }">
            <button
              type="button"
              class="group flex w-full items-center p-2 text-xs font-semibold"
              :class="[active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700']"
              @click="emit('sortTags', 'stars_count', 'asc')"
            >
              <StarsCountLowIcon class="mr-1 h-4 w-4 text-gray-400 group-hover:text-indigo-500" aria-hidden="true" />

              <span>Fewest Stars</span>
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>
