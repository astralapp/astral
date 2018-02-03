<template>
  <li class="p-4 border-b border-grey-light cursor-pointer" :class="{'shadow-inner bg-grey-lightest': selected, 'bg-white': !selected}" @dragstart="starDragged">
    <h3 class="repo-name text-base text-brand mb-2 font-bold" v-once>{{ star.node.nameWithOwner }}</h3>
    <p class="text-dark-grey text-sm" v-once>{{ star.node.description }}</p>
    <star-tags 
      :tags="normalizedStarTags"
      :star="star"
    ></star-tags>
    <div class="star-meta flex items-center mt-4">
      <div class="stargazers-count flex items-center text-grey-dark mr-2">
        <feather-icon type="star" class="stroke-current h-4"></feather-icon>
        <span class="text-xs" v-once>{{ star.node.stargazers.totalCount }}</span>
      </div>
      <div class="fork-count flex items-center text-grey-dark mr-4">
        <feather-icon type="share-2" class="stroke-current h-4"></feather-icon>
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
  </li>
</template>
<script>
import StarTags from './StarTags'
export default {
  name: 'Star',
  props: ['star', 'selected'],
  components: {
    StarTags
  },
  computed: {
    normalizedStarTags() {
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
    starDragged(e) {
      const data = JSON.stringify(this.star.node)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', data)
    }
  }
}
</script>