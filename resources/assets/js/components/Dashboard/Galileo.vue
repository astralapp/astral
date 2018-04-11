<template>
  <div class="search-container bg-white border-b border-r border-grey-light h-16 px-4 flex items-center justify-center">
    <div class="relative w-full">
      <input
        type="text"
        class="search-input text-grey-darkest h-10 border-2 border-grey-light rounded pr-2 pl-8 w-full focus-none transition-border-color"
        placeholder="Gaze through your telescope"
        v-model="currentSearchQuery" >
      <Icon
        type="SearchIcon"
        class="search-input-icon absolute fill-none stroke-grey transition-stroke"
        height="18"/>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import Icon from '@/components/Icon'

export default {
  name: 'Galileo',
  components: {
    Icon
  },
  computed: {
    ...mapGetters({
      query: 'searchQuery'
    }),
    currentSearchQuery: {
      get () {
        return this.query
      },
      set (query) {
        this.setSearchQuery(query)
      }
    }
  },
  methods: {
    ...mapActions(['setSearchQuery'])
  }
}
</script>
<style lang="scss">
.search-input:focus {
  border-color: config('colors.grey');
  + .search-input-icon {
    stroke: config('colors.grey');
  }
}
.search-input-icon {
  top: 11px;
  left: 8px;
  stroke: config('colors.grey-light');
}
</style>
