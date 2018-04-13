<template>
  <div class="stars border-r border-grey-light bg-grey-lighter relative overflow-hidden">
    <GlobalEvents
      @keyup.down="nextStar"
      @keyup.up="previousStar"
    />
    <collection-cluster
      :items="filteredStars"
      v-bind="cluster"
      class="overflow-y-scroll">
      <div
        slot="star"
        :key="item.value.node.id"
        slot-scope="{cell, item}">
        <Star
          :star="item.value"
          :data-id="item.value.node.id"
          :selected="starIsCurrentStar(item.value)"
          draggable="true"
          @dragstart.native="starDragged($event)"
          @dragend.native="clearClonedRepoNodes"
          @click.native="handleClick($event, item.value)"
        />
      </div>
    </collection-cluster>
  </div>
</template>
<script>
import GlobalEvents from 'vue-global-events'
import CollectionCluster from 'vue-collection-cluster'
import { mapGetters, mapActions } from 'vuex'
import Star from '@/components/Dashboard/Star'
import galileo from '@/filters/galileo'
export default {
  name: 'StarList',
  components: {
    CollectionCluster,
    GlobalEvents,
    Star
  },
  props: ['stars'],
  data () {
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
      'currentStarIndex',
      'currentStars',
      'currentLanguage',
      'viewingUntagged',
      'tokenizedSearchQuery'
    ]),
    filteredStars () {
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
            return (
              star.node.primaryLanguage &&
              star.node.primaryLanguage.name === this.currentLanguage
            )
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
    currentStar (newValue, oldValue) {
      if (!Object.keys(newValue).length) {
        return false
      }

      if (
        !(Object.keys(oldValue).length && oldValue.node.id === newValue.node.id)
      ) {
        this.fetchReadme(newValue.node.nameWithOwner)
      }
    }
  },
  methods: {
    ...mapActions(['setCurrentStar', 'fetchReadme', 'addToCurrentStars']),
    starDragged (e) {
      let width, height
      const el = e.currentTarget
      const clone = el.cloneNode(true)
      if (this.currentStars.length > 1) {
        clone.children[0].outerText += ` + ${this.currentStars.length - 1} more`
      }
      clone.id = 'repo-clone'
      document.body.appendChild(clone)
      width = clone.offsetWidth
      height = clone.offsetHeight
      e.dataTransfer.setDragImage(clone, width / 2, height / 2)
    },
    clearClonedRepoNodes () {
      document.getElementById('repo-clone').remove()
    },
    starIsCurrentStar (star) {
      return (
        (!!Object.keys(this.currentStar).length &&
        this.currentStar.node.id === star.node.id) ||
        this.currentStars.includes(star)
      )
    },
    previousStar (e) {
      if (this.shouldDisableKeyShortcuts(e)) {
        return false
      }
      if (this.currentStarIndex === 0) return
      const previousStar = this.stars[this.currentStarIndex - 1]
      this.setCurrentStar(previousStar)
    },
    nextStar (e) {
      if (this.shouldDisableKeyShortcuts(e)) {
        return false
      }
      if (this.currentStarIndex === this.stars.length - 1) return
      const nextStar =
        this.currentStarIndex === -1
          ? this.stars[0]
          : this.stars[this.currentStarIndex + 1]
      this.setCurrentStar(nextStar)
    },
    shouldDisableKeyShortcuts (e) {
      return (
        e.target.tagName === 'INPUT' ||
        document.querySelector('.CodeMirror-focused')
      )
    },
    handleClick (e, star) {
      if (e.shiftKey) {
        this.addToCurrentStars(star)
      } else {
        this.setCurrentStar(star)
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
