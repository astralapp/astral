<template>
  <sidebar-item
    :badge="tag.stars_count"
    icon="TagIcon"
    icon-size="14"
    class="tag rounded"
    :class="{
      'selected': isSelected,
      'dragging': isHighlighted
    }"
    :title="tag.name"
    @dragover.native.stop.prevent="highlight" @dragleave.native.stop.prevent="unhighlight" @drop.native.stop.prevent="starDropped"
  >
    <div class="opacity-0 transition-opacity edit-tag absolute pin-r" :class="{'opacity-100': editTagDropdownShowing}">
      <button @click.stop="editTagDropdownShowing = !editTagDropdownShowing" class="text-grey hover:text-white px-2">
        <Icon type="MoreHorizontalIcon" height="14" class="edit-tag-icon stroke-none fill-current relative"></Icon>
      </button>
      <edit-tag-dropdown :tag="tag" :visible="editTagDropdownShowing" @deleteTag="deleteTag" v-click-outside="hideEditTagDropdown" @renameTag="renameTag"></edit-tag-dropdown>
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
      this.$emit('deleteTag', this.tag.id)
      this.hideEditTagDropdown()
    },
    renameTag(name) {
      this.$emit('renameTag', { id: this.tag.id, name: name })
      this.hideEditTagDropdown()
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
    starDropped(e) {
      const dropData = JSON.parse(e.dataTransfer.getData('text'))
      this.unhighlight()
      this.$emit('starDropped', { data: dropData, id: this.tag.id })
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
      stroke: config('colors.brand');
    }
  }
  &.gu-mirror,
  &.gu-transit {
    transition: none !important;
  }
}
</style>
