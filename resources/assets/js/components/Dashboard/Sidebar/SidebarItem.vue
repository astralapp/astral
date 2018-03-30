<template>
  <li class="dashboard-list-item flex items-center relative py-2 pr-1 text-base font-semibold text-grey cursor-pointer" :class="{'dragging': isHighlighted}" @dragover.stop.prevent="highlight" @dragleave.stop.prevent="unhighlight" @drop.stop.prevent="starDropped">
    <Icon :type="icon" v-if="icon" :height="iconSize" class="mr-1 pointer-events-none stroke-current fill-none relative"></Icon>
    <span class="dashboard-list-item-name flex-grow truncate pointer-events-none">{{ title }}</span>
    <div class="opacity-0 transition-opacity edit-tag absolute pin-r" v-if="starTarget" :class="{'opacity-100': editTagDropdownShowing}">
      <button @click.stop="editTagDropdownShowing = !editTagDropdownShowing" class="text-grey hover:text-white px-2">
        <Icon type="MoreHorizontalIcon" :height="iconSize" class="edit-tag-icon stroke-none fill-current relative"></Icon>
      </button>
      <edit-tag-dropdown :tag="tag" :visible="editTagDropdownShowing" @deleteTag="deleteTag" v-click-outside="hideEditTagDropdown" @renameTag="renameTag"></edit-tag-dropdown>
    </div>
    <span class="dashboard-list-item-badge text-white bg-white-10 rounded-full inline-block text-xs font-semibold pointer-events-none ml-1" v-if="!!badge" :class="{'opacity-0': editTagDropdownShowing}">{{ badge }}</span>
  </li>
</template>
<script>
import vClickOutside from 'v-click-outside'
import EditTagDropdown from '@/components/Dashboard/Sidebar/EditTagDropdown'
import Icon from '@/components/Icon'
export default {
  name: 'SidebarItem',
  directives: {
    clickOutside: vClickOutside.directive
  },
  components: {
    EditTagDropdown,
    Icon
  },
  props: {
    title: String,
    icon: String,
    iconSize: {
      type: [String, Number],
      default: 16
    },
    badge: {
      type: [String, Number],
      default: 0
    },
    starTarget: {
      type: Boolean,
      default: false
    },
    tag: {
      type: Object,
      required: false
    }
  },
  data () {
    return {
      isHighlighted: false,
      editTagDropdownShowing: false
    }
  },
  methods: {
    deleteTag () {
      this.$emit('deleteTag', this.tag.id)
      this.hideEditTagDropdown()
    },
    renameTag (name) {
      this.$emit('renameTag', { id: this.tag.id, name: name })
      this.hideEditTagDropdown()
    },
    hideEditTagDropdown (e) {
      console.log(e)
      this.editTagDropdownShowing = false
    },
    highlight () {
      if (this.starTarget) {
        this.isHighlighted = true
      }
    },
    unhighlight () {
      if (this.starTarget) {
        this.isHighlighted = false
      }
    },
    starDropped (e) {
      if (this.starTarget) {
        const dropData = JSON.parse(e.dataTransfer.getData('text'))
        const tagId = this.$el.dataset.id
        this.unhighlight()
        this.$emit('starDropped', { data: dropData, id: tagId })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.dashboard-list-item {
  transition: transform 250ms ease, opacity 250ms ease, color 250ms ease,
    background-color 250ms ease;
  &-badge {
    transition: background-color 250ms ease, opacity 250ms ease;
    padding: 0.3rem 0.7rem;
  }
  svg {
    transition: stroke 250ms ease;
  }
  &:hover {
    color: #fff;
    .dashboard-list-item-badge {
      background: rgba(#fff, 0.2);
    }
    svg:not(.edit-tag-icon) {
      stroke: #fff;
    }
    .edit-tag {
      opacity: 1;
    }
  }
  &.tag:hover {
    .dashboard-list-item-badge {
      opacity: 0;
    }
  }
  &.selected {
    color: config('colors.brand');
    .dashboard-list-item-badge {
      background: config('colors.brand');
    }
    svg:not(.edit-tag-icon) {
      stroke: config('colors.brand');
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
  &.gu-mirror,
  &.gu-transit {
    transition: none !important;
  }
}
</style>
