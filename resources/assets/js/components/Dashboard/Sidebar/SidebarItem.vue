<template>
  <li class="dashboard-list-item flex items-center relative py-2 pr-1 text-base font-semibold text-grey cursor-pointer">
    <Icon
      v-if="icon"
      :type="icon"
      :height="iconSize"
      class="mr-1 pointer-events-none stroke-current fill-none relative"/>
    <span class="dashboard-list-item-name flex-grow truncate pointer-events-none">{{ title }}</span>
    <slot/>
    <span
      v-if="!!badge"
      class="dashboard-list-item-badge text-white bg-white-10 rounded-full inline-block text-xs font-semibold pointer-events-none ml-1">{{ badge }}</span>
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
      default: 16
    },
    badge: {
      type: [String, Number],
      default: 0
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
    pointer-events: none;
  }
  svg {
    transition: stroke 250ms ease;
  }
  &:hover {
    color: #fff;
    .dashboard-list-item-badge {
      background: rgba(#fff, 0.2);
    }
  }
  &.selected {
    color: config('colors.brand');
    .dashboard-list-item-badge {
      background: config('colors.brand');
    }
  }
}
</style>
