<template>
  <div
    class="search-container bg-white border-b border-r border-grey-light h-16 px-4 flex items-center justify-center"
  >
    <GlobalEvents
      :filter="(event, handler, eventName) => shouldDisableKeyboardShortcuts(event)"
      @keyup.prevent.191.exact="focusInput"
    />
    <div class="relative w-full">
      <input
        ref="searchInput"
        v-model="currentSearchQuery"
        type="text"
        class="search-input text-input w-full pl-8 pr-8"
        placeholder="Gaze through your telescope"
        @focus="inputFocused = true"
        @blur="inputFocused = false"
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
      >&times;</button>
      <div
        v-show="!inputFocused && !query"
        class="w-6 h-6 bg-transparent text-grey-light border-grey-light border rounded-sm flex justify-center items-center absolute pin-t pin-r mt-2 nudge-up-t mr-2 pointer-events-none"
      >/</div>
    </div>
  </div>
</template>
<script>
import GlobalEvents from 'vue-global-events'
import { mapActions, mapGetters } from 'vuex'
import Icon from '@/components/Icon'
import shouldDisableKeyboardShortcutsMixin from '@/mixins/disable-kb-shortcuts'

export default {
  name: 'Galileo',
  components: {
    GlobalEvents,
    Icon
  },
  mixins: [shouldDisableKeyboardShortcutsMixin],
  data() {
    return {
      inputFocused: false
    }
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
    focusInput() {
      this.$refs.searchInput.focus()
    },
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
