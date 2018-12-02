<template>
  <SidebarItem
    :badge="tag.stars_count"
    :class="{
      selected: isSelected,
      dragging: isHighlighted,
      editing: editTagDropdownShowing
    }"
    :title="tag.name"
    icon="TagIcon"
    icon-size="14"
    class="tag rounded"
    @dragover.native.stop.prevent="highlight"
    @dragleave.native.stop.prevent="unhighlight"
    @drop.native.stop.prevent="starsDropped"
  >
    <div
      v-click-outside="hideEditTagDropdown"
      :class="{'opacity-100': editTagDropdownShowing}"
      class="opacity-0 transition-opacity edit-tag absolute pin-r"
    >
      <button class="text-grey hover:text-white px-2" @click="toggleEditTagDropdown">
        <Icon
          type="MoreHorizontalIcon"
          height="14"
          class="edit-tag-icon stroke-none fill-current relative"
        />
      </button>
      <edit-tag-dropdown
        ref="editTagDropdown"
        :tag="tag"
        :visible="editTagDropdownShowing"
        @deleteTag="deleteTag"
        @renameTag="renameTag"
      />
    </div>
  </sidebar-item>
</template>
<script>
import vClickOutside from 'v-click-outside'
import SidebarItem from '@/components/Dashboard/Sidebar/SidebarItem'
import EditTagDropdown from '@/components/Dashboard/Sidebar/EditTagDropdown'
import Icon from '@/components/Icon'
export default {
  name: 'SidebarTag',
  directives: {
    clickOutside: vClickOutside.directive
  },
  components: {
    SidebarItem,
    EditTagDropdown,
    Icon
  },
  props: ['tag', 'isSelected'],
  data() {
    return {
      editTagDropdownShowing: false,
      isHighlighted: false
    }
  },
  methods: {
    deleteTag() {
      this.$emit('deleteTag', { id: this.tag.id, name: this.tag.name })
      this.hideEditTagDropdown()
    },
    renameTag(name) {
      this.$emit('renameTag', { id: this.tag.id, name: name })
      this.hideEditTagDropdown()
    },
    toggleEditTagDropdown() {
      this.editTagDropdownShowing = !this.editTagDropdownShowing
    },
    hideEditTagDropdown() {
      this.editTagDropdownShowing = false
    },
    highlight() {
      this.isHighlighted = true
    },
    unhighlight() {
      this.isHighlighted = false
    },
    starsDropped(e) {
      const dropData = JSON.parse(e.dataTransfer.getData('text'))
      this.unhighlight()
      this.$emit('starsDropped', { data: dropData, id: this.tag.id })
    }
  }
}
</script>
<style lang="scss">
.dashboard-list-item.tag {
  &:hover {
    .dashboard-list-item-badge {
      opacity: 0;
    }
    .edit-tag {
      opacity: 1;
    }
  }
  &.dragging {
    background: config('colors.brand');
    color: #fff;
    .dashboard-list-item-badge {
      background: #fff;
      color: config('colors.brand');
    }
    svg {
      stroke: #fff;
    }
  }
  &.selected {
    .edit-tag-icon {
      stroke: config('colors.grey');
      &:hover {
        stroke: config('colors.white');
      }
    }
  }
  &.editing {
    .dashboard-list-item-badge {
      opacity: 0;
    }
  }
  &.gu-mirror,
  &.gu-transit {
    transition: none !important;
  }
}
</style>
