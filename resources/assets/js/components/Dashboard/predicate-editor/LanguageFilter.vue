<template>
  <div class="text-input text-sm px-2 w-64 ml-4 pb-0 flex-grow cursor-text">
    <ul class="list-reset flex flex-wrap items-start" @click.stop="focusInput">
      <li
        v-for="language in languages"
        :key="language.name"
        class="text-xs text-white bg-indigo hover:bg-indigo-dark transition-bg rounded-full py-1 px-2 mr-2 mb-2"
      >
        <span>{{ language.name }}</span>
        <span>
          <button class="ml-2 text-white text-sm" @click.stop="removeLanguage(language)">
            &times;
          </button>
        </span>
      </li>
      <li :class="{ 'mb-2': languages.length === 0 }">
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
      languages: this.value,
      search: '',
      placeholder: 'Find a language',
      isEditing: false
    }
  },
  computed: {
    ...mapGetters({
      allLanguages: 'languages'
    }),
    suggestions() {
      return differenceBy(this.allLanguages, this.languages, 'name').map(language => language.name)
    },
    languageNames() {
      return this.languages.map(language => language.name)
    }
  },
  watch: {
    languages() {
      if (this.awesomplete) {
        this.awesomplete.list = this.suggestions
      }
      this.$emit('change', this.languages)
    }
  },
  mounted() {
    this.initAwesomplete()
  },
  methods: {
    addLanguage(name) {
      if (name.trim() !== '') {
        this.languages.push({
          name: name.trim().replace(',', '')
        })
        this.search = ''
      }
      this.focusInput()
    },
    removeLanguageAtIndex(index) {
      this.$delete(this.languages, index)
    },
    removeLanguage(language) {
      this.focusInput()
      const index = this.languages.findIndex(l => l.name === language.name)
      this.removeLanguageAtIndex(index)
    },
    deletePressed() {
      if (this.search === '' && this.languages.length) {
        this.removeLanguageAtIndex(this.languages.length - 1)
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
        this.addLanguage(e.text.value.trim())
      }
    },
    focusInput() {
      this.$refs.search.focus()
    }
  }
}
</script>
