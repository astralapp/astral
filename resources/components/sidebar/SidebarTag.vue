<script lang="ts" setup>
import { ref } from 'vue'
import SidebarItem from '@/views/components/sidebar/SidebarItem.vue'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import WatchValue from '@/views/components/shared/core/WatchValue.vue'
import { TagIcon } from '@heroicons/vue/outline'
import { DotsHorizontalIcon, PencilAltIcon, TrashIcon } from '@heroicons/vue/solid'
import { useStarsStore } from '@/scripts/store/useStarsStore'
import { useTagsStore } from '@/scripts/store/useTagsStore'
import { useRenameTagDialog } from '@/scripts/composables/useRenameTagDialog'
import { useGlobalToast } from '@/scripts/composables/useGlobalToast'
import { useConfirm } from '@/scripts/composables/useConfirm'
import { StarDragDataTransferData, Tag } from '@/scripts/types'

const props = defineProps<{
  tag: Tag
  isActive: boolean
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
      tag: props.tag,
      repos: starsStore.draggingRepos.map(({ databaseId, nameWithOwner, url, description }) => ({
        databaseId,
        nameWithOwner,
        url,
        description,
      })),
    })

    isHighlighted.value = false
  }

  e.preventDefault()
}

const deleteTag = async () => {
  if (
    await isConfirmed(`Are you sure you want to delete the "${props.tag.name}" tag?`, {
      confirmLabel: "Yes, I'm sure",
      cancelLabel: 'Nevermind',
    })
  ) {
    tagsStore.deleteTag(props.tag.id)

    showToast(`The ${props.tag.name} tag was deleted.`)
  }
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
      <TagIcon />
    </template>

    <template #contextMenu>
      <div :class="[tag.stars_count && 'absolute right-0 top-0']">
        <Menu v-slot="{ open }" as="div" class="relative">
          <WatchValue :value="open" @change="isContextMenuActive = !!$event" />

          <MenuButton
            class="right-0 top-0 h-5 w-5 text-gray-300 opacity-0 transition-opacity hover:text-gray-200 group-hover:opacity-100"
            :class="[open && 'opacity-100']"
            @click.stop
          >
            <DotsHorizontalIcon />
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
                    @click.stop="showRenameTagDialog(tag)"
                  >
                    <PencilAltIcon
                      class="mr-1 h-4 w-4 text-gray-400 group-hover/menu-item:text-indigo-500"
                      aria-hidden="true"
                    />

                    <span>Rename</span>
                  </button>
                </MenuItem>

                <MenuItem v-slot="{ active }">
                  <button
                    class="group/menu-item flex w-full items-center p-2 text-xs font-semibold"
                    :class="[active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700']"
                    @click.stop="deleteTag"
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

<style></style>
