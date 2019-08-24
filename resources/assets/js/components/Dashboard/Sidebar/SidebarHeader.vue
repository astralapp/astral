<template>
  <div class="flex flex-grow items-center h-4 my-3 pr-1 relative">
    <h3 class="inline-block m-0 text-grey-darker flex-grow font-semibold uppercase text-sm select-none">{{ title }}</h3>
    <div class="sidebar-header-control h-full relative nudge-b ml-auto">
      <slot />
    </div>
  </div>
</template>
<script>
export default {
  name: 'SidebarHeader',
  props: {
    title: String
  }
}
</script>
