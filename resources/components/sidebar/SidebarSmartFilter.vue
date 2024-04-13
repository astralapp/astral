<script setup lang="ts">
import WatchValue from '@/components/shared/core/WatchValue.vue'
import SidebarItem from '@/components/sidebar/SidebarItem.vue'
import { useConfirm } from '@/composables/useConfirm'
import { useSmartFilterDialog } from '@/composables/useSmartFilterDialog'
import { useSmartFiltersStore } from '@/store/useSmartFiltersStore'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { FunnelIcon as FilterIcon } from '@heroicons/vue/24/outline'
import { EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/solid'
import { ref } from 'vue'

const props = defineProps<{
  smartFilter: App.Data.SmartFilterData
}>()

const smartFiltersStore = useSmartFiltersStore()
const { show: showSmartFilterDialog } = useSmartFilterDialog()
const { isConfirmed } = useConfirm()

const isContextMenuActive = ref(false)

const deleteSmartFilter = async () => {
  if (
    await isConfirmed(`Are you sure you want to delete the "${props.smartFilter.name}" smart filter?`, {
      cancelLabel: 'Nevermind',
      confirmLabel: "Yes, I'm sure",
    })
  ) {
    smartFiltersStore.deleteSmartFilter(props.smartFilter.id)
  }
}
</script>

<template>
  <SidebarItem
    :title="smartFilter.name"
    :is-active="false"
    has-context-menu
    :is-context-menu-active="isContextMenuActive"
    class="group/sidebar-item rounded-md py-1"
  >
    <template #icon>
      <FilterIcon />
    </template>

    <template #contextMenu>
      <div>
        <Menu
          v-slot="{ open }"
          as="div"
          class="relative"
        >
          <WatchValue
            :value="open"
            @change="isContextMenuActive = !!$event"
          />

          <MenuButton
            class="right-0 top-0 h-5 w-5 text-gray-300 opacity-0 transition-opacity hover:text-gray-200 group-hover/sidebar-item:opacity-100"
            :class="[open && 'opacity-100']"
            @click.stop
          >
            <EllipsisHorizontalIcon />
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
              class="absolute right-2 z-20 mt-2 w-28 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:right-0"
            >
              <div class="py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    class="group/menu-item flex w-full items-center p-2 text-xs font-semibold"
                    :class="[active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700']"
                    @click.stop="showSmartFilterDialog(smartFilter)"
                  >
                    <PencilSquareIcon
                      class="mr-1 h-4 w-4 text-gray-400 group-hover/menu-item:text-indigo-500"
                      aria-hidden="true"
                    />

                    <span>Edit</span>
                  </button>
                </MenuItem>

                <MenuItem v-slot="{ active }">
                  <button
                    class="group/menu-item flex w-full items-center p-2 text-xs font-semibold"
                    :class="[active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700']"
                    @click.stop="deleteSmartFilter"
                  >
                    <TrashIcon
                      class="mr-1 h-4 w-4 text-gray-400 group-hover/menu-item:text-indigo-500"
                      aria-hidden="true"
                    />

                    <span>Delete</span>
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </template>
  </SidebarItem>
</template>
