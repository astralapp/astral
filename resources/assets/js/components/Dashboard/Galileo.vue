<template>
  <div class="flex items-center justify-center h-16 px-4 bg-white border-b border-r search-container border-grey-light">
    <GlobalEvents
      :filter="(event, handler, eventName) => shouldDisableKeyboardShortcuts(event)"
      @keyup.prevent.191.exact="focusInput"
    />
    <div class="relative w-full">
      <input
        ref="searchInput"
        v-model="currentSearchQuery"
        type="text"
        class="w-full pl-8 pr-8 search-input text-input"
        placeholder="Gaze through your telescope"
        @focus="inputFocused = true"
        @blur="inputFocused = false"
      />
      <Icon
        type="SearchIcon"
        class="absolute pointer-events-none search-input-icon fill-none stroke-grey transition-stroke"
        height="18"
      />
      <button
        v-if="query"
        class="absolute w-6 h-6 bg-transparent rounded-full clear-search-icon text-1xl text-grey-darker focus-none hover:bg-grey-light transition-bg"
        @click="resetSearch"
      >
        &times;
      </button>
      <div
        v-show="!inputFocused && !query"
        class="absolute flex items-center justify-center w-6 h-6 mt-2 mr-2 bg-transparent border rounded-sm pointer-events-none text-grey-light border-grey-light pin-t pin-r nudge-up-t"
      >
        /
      </div>
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
