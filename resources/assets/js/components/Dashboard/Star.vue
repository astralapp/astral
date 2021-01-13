<template>
  <div
    :class="{ 'selected shadow-inner bg-grey-lightest': selected, 'bg-white': !selected }"
    class="relative p-4 border-b cursor-pointer star border-grey-light hover:bg-grey-lightest transition-bg group"
    @dragstart="starDragged"
  >
    <div class="flex items-center">
      <h3 v-once :class="`repo-name text-base ${archived('brand')} mb-2 font-bold break-words`">
        {{ star.node.nameWithOwner }}
      </h3>
      <div
        v-if="star.node.isArchived"
        class="flex items-center justify-end flex-grow mb-4 font-semibold is-archived text-grey-dark"
      >
        <Icon type="ArchiveIcon" class="h-4 stroke-current" />
        <span v-once class="text-xs">Archived</span>
      </div>
    </div>
    <p v-once :class="`${archived('dark-grey')} text-sm`">
      {{ star.node.description }}
    </p>
    <StarTags :star="star" />
    <div class="flex items-center mt-4 star-meta">
      <div class="flex items-center mr-2 stargazers-count text-grey-dark">
        <Icon type="StarIcon" class="h-4 stroke-current" />
        <span v-once class="text-xs">{{ star.node.stargazers.totalCount }}</span>
      </div>
      <div class="flex items-center mr-2 fork-count text-grey-dark">
        <Icon type="GitPullRequestIcon" class="h-4 stroke-current" />
        <span v-once class="text-xs">{{ star.node.forkCount }}</span>
      </div>
      <div v-if="star.node.releases.edges.length" class="flex items-center mr-2 latest-version text-grey-dark">
        <Icon type="SaveIcon" class="h-4 stroke-current" />
        <span v-once class="text-xs">{{ normalizedReleaseVersion }}</span>
      </div>
      <div v-if="star.node.pushedAt" class="flex items-center mr-4 updated-at text-grey-dark">
        <Icon type="CalendarIcon" class="h-4 stroke-current" />
        <span v-once class="text-xs">{{ getRelativeDate }}</span>
      </div>
      <div class="flex items-center justify-end flex-grow github-link text-grey-dark">
        <a
          :href="star.node.url"
          class="text-xs font-bold text-grey-dark hover:no-underline"
          target="_blank"
          rel="noopener noreferrer"
          @click.stop
        >
          <Icon type="GithubIcon" class="h-4 stroke-current" />
        </a>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import StarTags from '@/components/Dashboard/StarTags'
import Icon from '@/components/Icon'
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(updateLocale)
dayjs.extend(relativeTime)

dayjs.updateLocale('en', {
  relativeTime: {
    future: '%s',
    past: '%s',
    s: 's',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1mo',
    MM: '%dmo',
    y: '1y',
    yy: '%dy'
  }
})

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
    },
    getRelativeDate() {
      return dayjs().to(dayjs(this.star.node.pushedAt))
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
    },
    archived(className) {
      return this.star.node.isArchived ? 'text-grey-dark' : `text-${className}`
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
  .is-archived {
    margin-block-start: 0.4em;
  }
}
</style>
