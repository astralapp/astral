<template>
  <div
    :class="{'selected shadow-inner bg-grey-lightest': selected, 'bg-white': !selected}"
    class="star relative p-4 border-b border-grey-light cursor-pointer hover:bg-grey-lightest transition-bg"
    @dragstart="starDragged">
    <h3
      v-once
      class="repo-name text-base text-brand mb-2 font-bold">
      {{ star.node.nameWithOwner }}
    </h3>
    <p
      v-once
      class="text-dark-grey text-sm">
      {{ star.node.description }}
    </p>
    <star-tags
      :tags="normalizedStarTags"
      :star="star"
    />
    <div class="star-meta flex items-center mt-4">
      <div class="stargazers-count flex items-center text-grey-dark mr-2">
        <Icon
          type="StarIcon"
          class="stroke-current h-4"/>
        <span
          v-once
          class="text-xs">
          {{ star.node.stargazers.totalCount }}
        </span>
      </div>
      <div class="fork-count flex items-center text-grey-dark mr-4">
        <Icon
          type="Share2Icon"
          class="stroke-current h-4"/>
        <span
          v-once
          class="text-xs">
          {{ star.node.forkCount }}
        </span>
      </div>
      <div class="github-link flex items-center text-grey-dark">
        <a
          :href="star.node.url"
          class="text-xs text-grey-dark font-bold hover:no-underline"
          target="_blank"
          rel="noopener"
          @click.stop>View on GitHub</a>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import StarTags from '@/components/Dashboard/StarTags'
import Icon from '@/components/Icon'
export default {
  name: 'Star',
  components: {
    Icon,
    StarTags
  },
  props: ['star', 'selected'],
  computed: {
    ...mapGetters(['currentStars']),
    normalizedStarTags () {
      if (!this.star.tags.length) {
        return this.star.tags
      } else {
        return this.star.tags.filter(tag => {
          if (!this.star.node.primaryLanguage) {
            return true
          } else {
            return (
              tag.name.toLowerCase() !==
              this.star.node.primaryLanguage.name.toLowerCase()
            )
          }
        })
      }
    },
    starInSelectedStars () {
      return this.currentStars.includes(this.star)
    }
  },
  methods: {
    starDragged (e) {
      let data = ''
      if (this.starInSelectedStars) {
        data = JSON.stringify(this.currentStars.map(star => star.node))
      } else {
        data = JSON.stringify(this.star.node)
      }
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', data)
    }
  }
}
</script>
<style lang="scss" scoped>
.star {
  &::before {
    transition: transform 150ms ease-in-out;
    transform: translate3d(-4px, 0, 0);
    background-color: config('colors.brand');
    content: '';
    display: block;
    width: 4px;
    position: absolute;
    top: 0;
    left: 0;
    bottom: -1px;
  }
  &.selected::before {
    transform: translate3d(0, 0, 0);
  }
}
</style>
