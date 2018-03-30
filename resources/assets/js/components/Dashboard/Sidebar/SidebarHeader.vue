<template>
  <div class="flex items-center h-4 my-3 relative">
    <h3 class="inline-block m-0 text-grey-darker flex-grow font-semibold uppercase text-sm">{{ title }}</h3>
    <div class="sidebar-header-control h-full relative nudge-b">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SidebarHeader',
  props: ['title']
}
</script>
