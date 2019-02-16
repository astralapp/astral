<template>
  <div class="stars border-r border-grey-light bg-grey-lighter relative overflow-hidden">
    <p
      v-if="!filteredStars.length"
      class="text-grey font-bold flex flex-col justify-center items-center h-full"
    >No Results</p>
    <GlobalEvents
      :filter="(event, handler, eventName) => shouldDisableKeyboardShortcuts(event)"
      @keyup.down="nextStar"
      @keyup.up="previousStar"
    />
    <CollectionCluster
      :items="filteredStars"
      v-bind="cluster"
      class="overflow-y-scroll"
      ref="collection"
    >
      <div
        slot="star"
        :key="item.value.node.databaseId"
        slot-scope="{cell, item}"
      >
        <Star
          :star="item.value"
          :data-id="item.value.node.databaseId"
          :selected="starIsCurrentStar(item.value)"
          draggable="true"
          @dragstart.native="starDragged($event, item.value)"
          @dragend.native="clearClonedRepoNodes"
          @click.native="handleClick($event, item.value)"
        />
      </div>
    </CollectionCluster>
  </div>
</template>
<script>
import GlobalEvents from 'vue-global-events'
import CollectionCluster from 'vue-collection-cluster'
import { mapGetters, mapActions } from 'vuex'
import Star from '@/components/Dashboard/Star'
import galileo from '@/filters/galileo'
import shouldDisableKeyboardShortcutsMixin from '@/mixins/disable-kb-shortcuts'
export default {
  name: 'StarList',
  components: {
    CollectionCluster,
    GlobalEvents,
    Star
  },
  mixins: [shouldDisableKeyboardShortcutsMixin],
  props: ['stars'],
  data() {
    return {
      cluster: {
        heightType: 'automatic',
        itemHeight: 168
      }
    }
  },
  computed: {
    ...mapGetters([
      'currentTag',
      'currentStar',
      'currentStarIndexes',
      'currentStars',
      'currentLanguage',
      'viewingUntagged',
      'tokenizedSearchQuery'
    ]),
    filteredStars() {
      const stars = this.stars
        .filter(star => {
          if (!Object.keys(this.currentTag).length) {
            return true
          } else {
            return star.tags.map(tag => tag.name).includes(this.currentTag.name)
          }
        })
        .filter(star => {
          if (this.currentLanguage === '') {
            return true
          } else {
            return star.node.primaryLanguage && star.node.primaryLanguage.name === this.currentLanguage
          }
        })
        .filter(star => {
          if (!this.viewingUntagged) {
            return true
          }

          return !star.tags.length
        })
        .map(star => {
          return { type: 'star', value: star }
        })

      return galileo(stars, this.tokenizedSearchQuery)
    }
  },
  watch: {
    currentStar(newValue, oldValue) {
      if (!Object.keys(newValue).length || this.currentStars.length > 1) {
        return false
      }
      const starIndex = this.filteredStars.findIndex(s => {
        return s.value.node.databaseId === newValue.node.databaseId
      })
      this.$refs.collection.scrollTo(this.currentStarIndexes[0])
      if (!(Object.keys(oldValue).length && oldValue.node.databaseId === newValue.node.databaseId)) {
        this.fetchReadme(newValue.node.nameWithOwner)
      }
    }
  },
  methods: {
    ...mapActions(['setCurrentStar', 'fetchReadme', 'pushToCurrentStars', 'selectStars']),
    starDragged(e, star) {
      let width, height
      const el = e.currentTarget
      const clone = el.cloneNode(true)
      if (this.currentStars.length > 1 && this.starIsCurrentStar(star)) {
        clone.children[0].innerText += ` + ${this.currentStars.length - 1} more`
      }
      clone.id = 'repo-clone'
      document.body.appendChild(clone)
      width = clone.offsetWidth
      height = clone.offsetHeight
      e.dataTransfer.setDragImage(clone, width / 2, height / 2)
    },
    clearClonedRepoNodes() {
      document.getElementById('repo-clone').remove()
    },
    starIsCurrentStar(star) {
      return (
        (this.currentStars.length && this.currentStar.node.databaseId === star.node.databaseId) ||
        this.currentStars.includes(star)
      )
    },
    previousStar(e) {
      if (this.currentStarIndexes[0] === 0 || !this.currentStarIndexes.length) return
      const lowestIndex = Math.min.apply(Math, this.currentStarIndexes)
      const previousStar = this.stars[lowestIndex - 1]
      this.setCurrentStar(previousStar)
    },
    nextStar(e) {
      if (this.currentStarIndex === this.stars.length - 1) return
      const nextStar = this.currentStarIndexes.length
        ? this.stars[Math.max.apply(Math, this.currentStarIndexes) + 1]
        : this.stars[0]
      this.setCurrentStar(nextStar)
    },
    handleClick(e, star) {
      if (e.shiftKey) {
        const starIndex = this.filteredStars.findIndex(s => {
          return s.value.node.databaseId === star.node.databaseId
        })
        const starsToPush = []
        // If no stars are selected simply select from index 0 to wherever they clicked
        if (!this.currentStars.length) {
          for (let i = 0; i <= starIndex; i++) {
            starsToPush.push(this.filteredStars[i].value)
          }
          this.selectStars(starsToPush)
        } else {
          let currentMax = Math.max.apply(Math, this.currentStarIndexes)
          let currentMin = Math.min.apply(Math, this.currentStarIndexes)
          if (starIndex < currentMax && starIndex >= currentMin) {
            for (let i = starIndex; i <= currentMax - 1; i++) {
              starsToPush.push(this.filteredStars[i].value)
            }
          } else if (starIndex < currentMin) {
            for (let i = starIndex; i <= currentMin - 1; i++) {
              starsToPush.push(this.filteredStars[i].value)
            }
          } else {
            for (let i = currentMax + 1; i <= starIndex; i++) {
              starsToPush.push(this.filteredStars[i].value)
            }
          }
          this.selectStars(this.currentStars.concat(starsToPush))
        }
      } else {
        if (e.ctrlKey || e.metaKey) {
          this.pushToCurrentStars(star)
        } else {
          this.setCurrentStar(star)
        }
      }
    }
  }
}
</script>
<style lang="scss">
.stars {
  transform: translate3d(0, 0, 0);
}
.collection-cluster {
  height: calc(100vh - 136px);
}
#repo-clone {
  transform: translate3d(-50%, -50%, 0);
  border-radius: 0.375rem;
  position: absolute;
  top: -9999px;
  left: -9999px;
  list-style-type: none;
  padding: 0.875rem;
  h3 {
    margin: 0;
  }
  &::before {
    display: none;
  }
  *:not(.repo-name) {
    display: none;
  }
}
</style>
