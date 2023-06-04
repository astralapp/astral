<script lang="ts" setup>
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import {
  CogIcon,
  UserGroupIcon,
  ChatAlt2Icon,
  ExclamationCircleIcon,
  LogoutIcon,
  ChevronDownIcon,
} from '@heroicons/vue/solid'
import GitHubLogoIcon from '@/views/components/shared/icons/GitHubLogoIcon.vue'
import { useUserStore } from '@/scripts/store/useUserStore'

const emit = defineEmits<{
  (e: 'showSettings'): void
}>()

const userStore = useUserStore()
</script>

<template>
  <Menu v-if="userStore.user" v-slot="{ open }" as="div" class="relative -mr-4 sm:mr-0">
    <div>
      <MenuButton
        class="flex items-center py-1 pl-2 pr-2 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-800 focus:ring-offset-2 focus:ring-offset-brand-600 sm:rounded-md sm:pl-1 sm:hover:bg-brand-800"
        :class="{ 'bg-brand-800': open }"
      >
        <img
          :src="userStore.user?.avatar"
          :alt="userStore.user?.username"
          class="image-rendering-crisp h-10 w-10 rounded-md"
        />

        <span class="ml-2 hidden text-sm font-semibold sm:inline-block">{{ userStore.user?.username }}</span>

        <ChevronDownIcon class="mt-0.5 ml-1 h-4 w-4 flex-shrink-0" :class="{ 'rotate-180': open }" aria-hidden="true" />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-2 z-20 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:right-0"
      >
        <div class="py-1">
          <MenuItem v-slot="{ active }">
            <button
              type="button"
              class="group flex w-full items-center px-4 py-2 text-sm"
              :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']"
              @click="emit('showSettings')"
            >
              <CogIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />

              <span>Settings</span>
            </button>
          </MenuItem>

          <MenuItem v-slot="{ active }">
            <a
              href="https://github.com/sponsors/syropian"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-center px-4 py-2 text-sm"
              :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']"
            >
              <UserGroupIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />

              <span>Become a sponsor</span>
            </a>
          </MenuItem>
        </div>

        <div class="py-1">
          <MenuItem v-slot="{ active }">
            <a
              href="https://github.com/astralapp/astral"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-center px-4 py-2 text-sm"
              :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']"
            >
              <GitHubLogoIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />

              <span>View on GitHub</span>
            </a>
          </MenuItem>

          <MenuItem v-slot="{ active }">
            <a
              href="https://github.com/astralapp/astral/discussions"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-center px-4 py-2 text-sm"
              :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']"
            >
              <ChatAlt2Icon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />

              <span>Discussions</span>
            </a>
          </MenuItem>

          <MenuItem v-slot="{ active }">
            <a
              href="https://github.com/astralapp/astral/issues"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-center px-4 py-2 text-sm"
              :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']"
            >
              <ExclamationCircleIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />

              <span>File an issue</span>
            </a>
          </MenuItem>
        </div>

        <div class="py-1">
          <MenuItem v-slot="{ active }">
            <a
              href="/logout"
              class="group flex items-center px-4 py-2 text-sm"
              :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']"
            >
              <LogoutIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />

              <span>Sign out</span>
            </a>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>
