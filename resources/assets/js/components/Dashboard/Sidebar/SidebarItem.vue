<template>
  <li class="dashboard-list-item flex items-center py-2 pr-1 text-base font-semibold text-grey cursor-pointer" :class="{'dragging': isHighlighted}" @dragover.stop.prevent="highlight" @dragleave.stop.prevent="unhighlight" @drop.stop.prevent="starDropped">
    <Icon :type="icon" v-if="icon" :height="iconSize" class="mr-1 pointer-events-none stroke-current fill-none"></Icon>
    <span class="dashboard-list-item-name flex-grow truncate pointer-events-none">{{ title }}</span>
    <span class="dashboard-list-item-badge text-white bg-white-10 rounded-full inline-block text-xs font-semibold pointer-events-none ml-1" v-if="!!badge">{{ badge }}</span>
  </li>
</template>
<script>
import Icon from '@/components/Icon'
export default {
  name: 'SidebarItem',
  components: {
    Icon
  },
  props: {
    title: String,
    icon: String,
    iconSize: {
      type: [String, Number],
      default: 4
    },
    badge: {
      type: [String, Number],
      default: 0
    },
    starTarget: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isHighlighted: false
    }
  },
  methods: {
    highlight() {
      if (this.starTarget) {
        this.isHighlighted = true
      }
    },
    unhighlight() {
      if (this.starTarget) {
        this.isHighlighted = false
      }
    },
    starDropped(e) {
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
    transition: background-color 250ms ease;
    padding: 0.3rem 0.7rem;
  }
  svg {
    transition: stroke 250ms ease;
  }
  &:hover {
    color: #fff;
    &-badge {
      background: rgba(#fff, 0.2);
    }
    svg {
      stroke: #fff;
    }
  }
  &.selected {
    color: config('colors.brand');
    .dashboard-list-item-badge {
      background: config('colors.brand');
    }
    svg {
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
