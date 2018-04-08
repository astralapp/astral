<template>
  <div class="p-4 border-b border-grey-light cursor-pointer hover:bg-grey-lightest transition-bg" :class="{'shadow-inner bg-grey-lightest': selected, 'bg-white': !selected}" @dragstart="starDragged">
    <h3 class="repo-name text-base text-brand mb-2 font-bold" v-once>{{ star.node.nameWithOwner }}</h3>
    <p class="text-dark-grey text-sm" v-once>{{ star.node.description }}</p>
    <star-tags
      :tags="normalizedStarTags"
      :star="star"
    ></star-tags>
    <div class="star-meta flex items-center mt-4">
      <div class="stargazers-count flex items-center text-grey-dark mr-2">
        <Icon type="StarIcon" class="stroke-current h-4"></Icon>
        <span class="text-xs" v-once>{{ star.node.stargazers.totalCount }}</span>
      </div>
      <div class="fork-count flex items-center text-grey-dark mr-4">
        <Icon type="Share2Icon" class="stroke-current h-4"></Icon>
        <span class="text-xs" v-once>{{ star.node.forkCount }}</span>
      </div>
      <div class="github-link flex items-center text-grey-dark">
        <a
        class="text-xs text-grey-dark font-bold hover:no-underline"
        :href="star.node.url"
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
  props: ['star', 'selected'],
  components: {
    Icon,
    StarTags
  },
  computed: {
    ...mapGetters([
      'currentStars',
    ]),
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
    }
  },
  methods: {
    starDragged (e) {
      let data = '';
      if (this.currentStars.length !== 0) {
        data = JSON.stringify(this.currentStars.map((star) => star.node))
      } else {
        data = JSON.stringify(this.star.node)
      }
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', data)
    }
  }
}
</script>
