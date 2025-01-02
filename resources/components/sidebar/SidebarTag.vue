<script lang="ts" setup>
import WatchValue from '@/components/shared/core/WatchValue.vue'
import SidebarItem from '@/components/sidebar/SidebarItem.vue'
import { useConfirm } from '@/composables/useConfirm'
import { useGlobalToast } from '@/composables/useGlobalToast'
import { useRenameTagDialog } from '@/composables/useRenameTagDialog'
import { useStarsStore } from '@/store/useStarsStore'
import { useTagsStore } from '@/store/useTagsStore'
import { StarDragDataTransferData } from '@/types'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { ref } from 'vue'

const props = defineProps<{
  isActive: boolean
  tag: App.Data.TagData
}>()

const emit = defineEmits<{
  (e: 'starsDropped', value: StarDragDataTransferData): void
}>()

const isHighlighted = ref(false)
const isContextMenuActive = ref(false)

const starsStore = useStarsStore()
const tagsStore = useTagsStore()
const { show: showRenameTagDialog } = useRenameTagDialog()
const { show: showToast } = useGlobalToast()
const { isConfirmed } = useConfirm()

const onDragOver = (e: DragEvent) => {
  e.preventDefault()

  if (starsStore.isDraggingRepo) {
    isHighlighted.value = true
  }
}

const onDragLeave = () => (isHighlighted.value = false)

const onDrop = (e: DragEvent) => {
  if (starsStore.isDraggingRepo && starsStore.draggingRepos.length) {
    emit('starsDropped', {
      repos: starsStore.draggingRepos.map(({ databaseId, nameWithOwner, url, description }) => ({
        databaseId,
        description,
        nameWithOwner,
        url,
      })),
      tag: props.tag,
    })

    isHighlighted.value = false
  }

  e.preventDefault()
}

const deleteTag = async () => {
  if (
    await isConfirmed(`Are you sure you want to delete the "${props.tag.name}" tag?`, {
      cancelLabel: 'Nevermind',
      confirmLabel: "Yes, I'm sure",
    })
  ) {
    tagsStore.deleteTag(props.tag.id)

    showToast(`The ${props.tag.name} tag was deleted.`)
  }
}

const baseMenuItemClasses = 'group/menu-item flex w-full items-center p-2 text-xs font-semibold'

const getMenuItemClasses = (isActive: boolean) => {
  return isActive
    ? `${baseMenuItemClasses} bg-indigo-50 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-400`
    : `${baseMenuItemClasses} text-gray-700 dark:text-gray-400`
}
</script>

<template>
  <SidebarItem
    :title="tag.name"
    :count="tag.stars_count"
    :is-active="isActive"
    :is-highlighted="isHighlighted"
    has-context-menu
    :is-context-menu-active="isContextMenuActive"
    class="sidebar-tag rounded-md py-1"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <template #icon>
      <i-lucide-tag class="w-4 h-4" />
    </template>

    <template #contextMenu>
      <div :class="[tag.stars_count && 'absolute right-0 top-0']">
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
            class="right-0 top-0 h-5 w-5 text-gray-300 opacity-0 transition-opacity hover:text-gray-200 group-hover:opacity-100"
            :class="[open && 'opacity-100']"
            @click.stop
          >
            <i-lucide-ellipsis
              class="w-full-h-full"
              role="presentation"
            />

            <span class="sr-only">Tag menu</span>
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
              class="absolute right-2 z-20 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:right-0 dark:bg-gray-800 dark:border dark:border-gray-700"
            >
              <div class="py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    :class="getMenuItemClasses(active)"
                    @click.stop="showRenameTagDialog(tag)"
                  >
                    <i-lucide-square-pen
                      class="mr-1 h-4 w-4 text-gray-400 group-hover/menu-item:text-indigo-500"
                      role="presentation"
                    />

                    <span>Rename</span>
                  </button>
                </MenuItem>

                <MenuItem v-slot="{ active }">
                  <button
                    :class="getMenuItemClasses(active)"
                    @click.stop="deleteTag"
                  >
                    <i-lucide-trash-2
                      class="mr-1 h-4 w-4 text-gray-400 group-hover/menu-item:text-indigo-500"
                      role="presentation"
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

<style></style>
