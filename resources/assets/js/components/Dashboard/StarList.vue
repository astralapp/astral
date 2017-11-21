<template>
  <div class="stars border-r border-grey-light bg-grey-lighter overflow-y-scroll relative">
    <ul class="list-reset">
      <Star 
        v-for="star in stars" 
        :star="star"
        :key="star.node.id"
      ></Star>
    </ul>
  </div>
</template>
<script>
import Star from './Star'
export default {
  name: 'StarList',
  props: ['stars'],
  components: {
    Star
  }
}
</script>

