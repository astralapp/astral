<template>
  <div
    class="search-container bg-white border-b border-r border-grey-light h-16 px-4 flex items-center justify-center"
  >
    <div class="relative w-full">
      <input
        v-model="currentSearchQuery"
        type="text"
        class="search-input text-input w-full pl-8 pr-8"
        placeholder="Gaze through your telescope"
      >
      <Icon
        type="SearchIcon"
        class="search-input-icon absolute fill-none stroke-grey transition-stroke"
        height="18"
      />
      <button
        v-if="query"
        class="clear-search-icon absolute text-1xl text-grey-darker focus-none rounded-full w-6 h-6 bg-transparent hover:bg-grey-light transition-bg"
        @click="resetSearch"
      >
        &times;
      </button>
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
      get() {
        return this.query
      },
      set(query) {
        this.setSearchQuery(query)
      }
    }
  },
  methods: {
    ...mapActions(['setSearchQuery']),
    resetSearch() {
      this.setSearchQuery('')
    }
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
  top: 10px;
  left: 8px;
  stroke: config('colors.grey-light');
}
.clear-search-icon {
  top: 7px;
  right: 7px;
  stroke: config('colors.grey-light');
}
</style>
