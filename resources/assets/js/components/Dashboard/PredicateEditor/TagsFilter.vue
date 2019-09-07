<template>
  <div class="text-input text-sm px-2 w-64 ml-4 pb-0 flex-grow cursor-text">
    <ul class="list-reset flex flex-wrap items-start" @click.stop="focusInput">
      <li
        v-for="tag in tags"
        :key="tag.name"
        class="text-xs text-white bg-indigo hover:bg-indigo-dark transition-bg rounded-full py-1 px-2 mr-2 mb-2"
      >
        <span>{{ tag.name }}</span>
        <span>
          <button class="remove-tag ml-2 text-white text-sm" @click.stop="removeTag(tag)">
            &times;
          </button>
        </span>
      </li>
      <li :class="{ 'mb-2': tags.length === 0 }">
        <input
          ref="search"
          v-model="search"
          v-autowidth="{ maxWidth: '960px', minWidth: '20px', comfortZone: 0 }"
          type="text"
          class="awesomplete-input text-grey-darkest text-sm focus-none"
          @click.stop
          @keydown.delete.stop="deletePressed"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import fuzzysearch from 'fuzzysearch'
import Awesomplete from 'awesomplete'
import { mapGetters } from 'vuex'
import { differenceBy } from 'lodash'
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      awesomplete: null,
      tags: this.value,
      search: '',
      placeholder: 'Find a tag',
      isEditing: false
    }
  },
  computed: {
    ...mapGetters({
      allTags: 'tags'
    }),
    suggestions() {
      return differenceBy(this.allTags, this.tags, 'name').map(tag => tag.name)
    },
    tagNames() {
      return this.tags.map(tag => tag.name)
    }
  },
  watch: {
    tags() {
      if (this.awesomplete) {
        this.awesomplete.list = this.suggestions
      }
      this.$emit('change', this.tags)
    }
  },
  mounted() {
    this.initAwesomplete()
  },
  methods: {
    addTag(name) {
      if (name.trim() !== '') {
        this.tags.push({
          name: name.trim().replace(',', '')
        })
        this.search = ''
      }
      this.focusInput()
    },
    removeTagAtIndex(index) {
      this.$delete(this.tags, index)
    },
    removeTag(tag) {
      this.focusInput()
      const index = this.tags.findIndex(t => t.name === tag.name)
      this.removeTagAtIndex(index)
    },
    deletePressed() {
      if (this.search === '' && this.tags.length) {
        this.removeTagAtIndex(this.tags.length - 1)
      }
    },
    initAwesomplete() {
      this.awesomplete = new Awesomplete(this.$refs.search, {
        autoFirst: true,
        filter(text, input) {
          return fuzzysearch(input.toLowerCase(), text.toLowerCase())
        },
        list: this.suggestions
      })

      this.$refs.search.addEventListener('awesomplete-select', this.suggestionSelected, false)
    },
    async suggestionSelected(e) {
      e.stopPropagation()
      if (e.target === this.$refs.search) {
        await this.$nextTick()
        this.addTag(e.text.value.trim())
      }
    },
    focusInput() {
      this.$refs.search.focus()
    }
  }
}
</script>

<style lang="scss">
.awesomplete-input {
  height: 22px;
}

.awesomplete [hidden] {
  display: none;
}

.awesomplete .visually-hidden {
  position: absolute;
  clip: rect(0, 0, 0, 0);
}

.awesomplete {
  display: inline-block;
  width: 100%;
  height: 100%;
  position: relative;
  > ul {
    background: #fff;
    background-clip: padding-box;
    border-radius: 0.25rem;
    border: 1px solid rgba(#000, 0.1);
    box-shadow: 0 2px 4px 0 rgba(#000, 0.1);
    box-sizing: border-box;
    left: 0;
    list-style: none;
    margin: 0;
    max-width: 200px;
    min-width: 200px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    text-shadow: none;
    z-index: 1;
    &:empty {
      display: none;
    }
    > li {
      font-size: 0.875rem;
      position: relative;
      padding: 0.5rem 1rem;
      cursor: pointer;
      &:hover {
        background: rgba(#1f9d55, 0.7);
        color: #fff;
      }
    }
    > li[aria-selected='true'] {
      background: config('colors.brand');
      color: #fff;
    }
  }
  mark {
    background: transparent;
    font-weight: bold;
  }
  li:hover mark {
    background: transparent;
    font-weight: bold;
  }
  li[aria-selected='true'] mark {
    background: transparent;
    font-weight: bold;
    color: inherit;
  }
}
@supports (transform: scale(0)) {
  .awesomplete > ul[hidden],
  .awesomplete > ul:empty {
    opacity: 0;
    display: block;
  }
}
</style>
