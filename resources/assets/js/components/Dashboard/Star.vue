<template>
  <div
    :class="{ 'selected shadow-inner bg-grey-lightest': selected, 'bg-white': !selected }"
    class="star relative p-4 border-b border-grey-light cursor-pointer hover:bg-grey-lightest transition-bg group"
    @dragstart="starDragged"
  >
    <div
      v-if="star.node.isArchived"
      class="border border-yellow-dark bg-yellow-lighter rounded-sm text-yellow-darker p-2 text-sm mb-4"
    >
      This repository has been archived by its owner.
    </div>
    <h3 v-once class="repo-name text-base text-brand mb-2 font-bold break-words">
      {{ star.node.nameWithOwner }}
    </h3>
    <p v-once class="text-dark-grey text-sm">
      {{ star.node.description }}
    </p>
    <StarTags :star="star" />
    <div class="star-meta flex items-center mt-4">
      <div class="stargazers-count flex items-center text-grey-dark mr-2">
        <Icon type="StarIcon" class="stroke-current h-4" />
        <span v-once class="text-xs">{{ star.node.stargazers.totalCount }}</span>
      </div>
      <div class="fork-count flex items-center text-grey-dark mr-2">
        <Icon type="Share2Icon" class="stroke-current h-4" />
        <span v-once class="text-xs">{{ star.node.forkCount }}</span>
      </div>
      <div v-if="star.node.releases.edges.length" class="latest-version flex items-center text-grey-dark mr-4">
        <Icon type="SaveIcon" class="stroke-current h-4" />
        <span v-once class="text-xs">{{ normalizedReleaseVersion }}</span>
      </div>
      <div class="github-link flex items-center text-grey-dark">
        <a
          :href="star.node.url"
          class="text-xs text-grey-dark font-bold hover:no-underline"
          target="_blank"
          rel="noopener"
          @click.stop
          >View on GitHub</a
        >
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
  props: {
    star: Object,
    selected: Boolean
  },
  computed: {
    ...mapGetters(['currentStars', 'user']),
    starInSelectedStars() {
      return this.currentStars.some(star => star.node.databaseId === this.star.node.databaseId)
    },
    normalizedReleaseVersion() {
      const tagName = this.star.node.releases.edges[0].node.tagName
      return tagName.startsWith('v') ? tagName : `v${tagName}`
    }
  },
  methods: {
    starDragged(e) {
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
