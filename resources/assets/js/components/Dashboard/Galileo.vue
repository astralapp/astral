<template>
  <div class="search-container bg-white border-b border-r border-grey-light h-16 px-4 flex items-center justify-center">
    <div class="relative w-full">
    <input type="text" class="search-input text-grey-darkest h-10 border-2 border-grey-light rounded pr-2 pl-8 w-full focus-none transition-border-color" placeholder="Gaze through your telescope" v-model="currentSearchQuery" />
    <feather-icon type="search" class="search-input-icon absolute fill-none stroke-grey transition-stroke" height="18"></feather-icon>  
    </div>
  </div>
</template>
<script>
import { debounce } from 'lodash'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'Galileo',
  computed: {
    ...mapGetters({
      query: 'searchQuery'
    }),
    currentSearchQuery: {
      get() {
        return this.query
      },
      set: debounce(function(query) {
        this.setSearchQuery(query)
      }, 300)
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
