<template>
  <div
    :class="{ 'px-2 pt-2 bg-white border border-grey-light': isEditing }"
    class="star-tags-editor rounded mt-4"
  >
    <GlobalEvents
      :filter="(event, handler, eventName) => shouldDisableKeyboardShortcuts(event) && isOnlySelectedStar"
      @keyup.t="startEditing"
    />
    <ul class="star-tags list-reset flex flex-wrap items-center">
      <li
        v-if="star.node.primaryLanguage && user.show_language_tags"
        v-show="!isEditing"
        class="text-xs text-white bg-brand hover:bg-brand-dark transition-bg rounded-full py-1 px-2 mr-2 mb-2"
        @click.stop="setCurrentLanguage(star.node.primaryLanguage.name)"
      >{{ star.node.primaryLanguage.name }}</li>
      <li
        v-for="tag in mutableTags"
        :key="tag.id"
        class="text-xs text-white bg-indigo hover:bg-indigo-dark transition-bg rounded-full py-1 px-2 mr-2 mb-2"
        @click.stop="setCurrentTag(tag)"
      >
        <span>{{ tag.name }}</span>
        <span>
          <button
            v-show="isEditing"
            class="remove-tag ml-2 text-white text-sm"
            @click.stop="removeTag(tag)"
          >&times;</button>
        </span>
      </li>
      <li class="mb-2">
        <input
          v-show="isEditing"
          ref="input"
          v-model="newTag"
          :placeholder="placeholder"
          type="text"
          class="text-grey-darkest text-sm h-6 focus-none"
          @click.stop
          @keyup.188="addTag(newTag)"
          @keyup.enter.stop="enterPressed"
          @keydown.delete.stop="deletePressed"
          @keyup.esc="escapePressed"
          @focus="onFocus"
          @blur="onBlur"
        >
      </li>
      <li class="mb-2">
        <button
          v-show="!isEditing"
          class="transition-opacity text-xs text-grey-darker bg-grey-lighter rounded-full py-1 px-2 mr-2 opacity-0 group-hover:opacity-100"
          @click.stop="startEditing"
        >Edit Tags</button>
      </li>
    </ul>
  </div>
</template>
<script>
import GlobalEvents from 'vue-global-events'
import nanoid from 'nanoid'
import fuzzysearch from 'fuzzysearch'
import Awesomplete from 'awesomplete'
import { differenceBy } from 'lodash'
import { mapGetters, mapActions } from 'vuex'
import shouldDisableKeyboardShortcutsMixin from '@/mixins/disable-kb-shortcuts'
export default {
  name: 'StarTags',
  components: {
    GlobalEvents
  },
  mixins: [shouldDisableKeyboardShortcutsMixin],
  props: ['star'],
  data () {
    return {
      awesomplete: null,
      mutableTags: [],
      newTag: '',
      placeholder: 'Add a tag',
      tagList: [],
      isEditing: false,
      canSaveTags: true
    }
  },
  computed: {
    ...mapGetters({
      allTags: 'tags',
      user: 'user',
      currentStars: 'currentStars'
    }),
    suggestions () {
      return differenceBy(this.allTags, this.mutableTags, 'name').map(
        tag => tag.name
      )
    },
    isOnlySelectedStar() {
      return this.currentStars.length === 1 && this.currentStars[0].node.databaseId === this.star.node.databaseId
    }
  },
  watch: {
    star: {
      handler () {
        this.mutableTags = [...this.star.tags]
      },
      immediate: true
    },
    mutableTags () {
      if (this.awesomplete) {
        this.awesomplete.list = this.suggestions
      }
    }
  },
  mounted () {
    this.mutableTags = [...this.star.tags]
  },
  methods: {
    ...mapActions(['syncStarTags', 'setCurrentTag', 'setCurrentLanguage']),
    startEditing () {
      this.isEditing = true
      this.initAwesomplete()
      this.$nextTick(() => {
        this.$refs.input.focus()
      })
    },
    addTag (name, e) {
      if (name.trim() !== '') {
        this.mutableTags.push({
          name: name.trim().replace(',', ''),
          id: nanoid()
        })
        this.newTag = ''
      }
      this.$refs.input.focus()
    },
    removeTagAtIndex (index) {
      this.$delete(this.mutableTags, index)
    },
    removeTag (tag) {
      this.$refs.input.focus()
      const index = this.mutableTags.findIndex(t => t.name === tag.name)
      this.removeTagAtIndex(index)
    },
    deletePressed () {
      if (this.newTag === '' && this.mutableTags.length) {
        this.removeTagAtIndex(this.mutableTags.length - 1)
      }
    },
    escapePressed() {
      this.mutableTags = []
      this.newTag = ''
      this.isEditing = false
    },
    enterPressed() {
      if (this.canSaveTags) {
        this.isEditing = false
      }
    },
    onFocus () {
      this.$emit('focus')
    },
    onBlur (e) {
      const isDeletingTag =
        e.relatedTarget && e.relatedTarget.classList.contains('remove-tag')

      const tagsHaveChanged = !!differenceBy(
        this.mutableTags,
        this.star.tags,
        'name'
      ).concat(differenceBy(this.star.tags, this.mutableTags, 'name')).length

      if (this.newTag === '' && !isDeletingTag) {
        const tagsToSync = this.mutableTags.map(tag => {
          return { name: tag.name }
        })
        this.isEditing = false
        this.awesomplete.destroy()
        if (tagsHaveChanged) {
          this.syncStarTags({
            id: this.star.node.databaseId,
            tags: tagsToSync
          })
        }
      }
    },
    initAwesomplete () {
      this.awesomplete = new Awesomplete(this.$refs.input, {
        autoFirst: true,
        filter (text, input) {
          return fuzzysearch(input.toLowerCase(), text.toLowerCase())
        },
        list: this.suggestions
      })

      this.$refs.input.addEventListener(
        'awesomplete-select',
        this.suggestionSelected,
        false
      )
    },
    suggestionSelected (e) {
      e.stopPropagation()
      if (e.target === this.$refs.input) {
        setTimeout(() => {
          const tagName = e.text.value.trim()
          this.addTag(tagName)
          setTimeout(() => {
            this.newTag = ''
            this.canSaveTags = false
            setTimeout(() => {
              this.canSaveTags = true
            }, 100)
          }, 0)
        }, 0)
      }
    }
  }
}
</script>
<style lang="scss">
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
