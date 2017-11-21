<template>
  <li class="p-4 border-b border-grey-light">
    <h3 class="text-base text-brand mb-2 font-bold" v-once>{{ star.node.nameWithOwner }}</h3>
    <p class="text-dark-grey text-sm" v-once>{{ star.node.description }}</p>
  </li>
</template>
<script>
export default {
  name: 'Star',
  props: ['star']
}
</script>

