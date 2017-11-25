<template>
  <li class="p-4 border-b border-grey-light cursor-pointer" :class="{'shadow-inner bg-grey-lightest': selected, 'bg-white': !selected}" @dragstart="starDragged">
    <h3 class="repo-name text-base text-brand mb-2 font-bold">{{ star.node.nameWithOwner }}</h3>
    <p class="text-dark-grey text-sm" v-once>{{ star.node.description }}</p>
    <ul class="star-tags list-reset mt-4 flex flex-wrap">
      <li 
        v-for="tag in normalizedStarTags" 
        :key="tag.id"
        class="text-xs text-white bg-indigo rounded-full py-1 px-2 mr-2"
        >
        {{ tag.name }}
      </li>
      <li 
        v-if="star.node.primaryLanguage"
        class="text-xs text-white bg-brand rounded-full py-1 px-2 mr-2"
      >
        {{ star.node.primaryLanguage.name }}
      </li>
    </ul>
  </li>
</template>
<script>
export default {
  name: 'Star',
  props: ['star', 'selected'],
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

