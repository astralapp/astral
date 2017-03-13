<template>
  <div class="dashboard-repos">
    <ul class="repos">
      <li class="repo" v-for="(repo, index) in starsList" :key="repo.id" draggable="true" @click="starClicked(repo)" :class="{ 'active': currentStar.id == repo.id }" ref="repo" :data-index="index">
        <h3 class="repo-name" v-once="repo.full_name"></h3>
        <div class="repo-description" v-once="repo.description"></div>
        <ul class="repo-tags">
          <transition-group name="star-tag" tag="ul">
            <li v-for="tag in repo.tags" :key="tag.slug" @click.stop="setTag(tag)">
              {{ tag.name }}
            </li>
          </transition-group>
        <div class="repo-stats">
          <div class="repo-stat stars"><i class="fa fa-star"></i> <span v-once="repo.stargazers_count"></span></div>
          <div class="repo-stat forks"><i class="fa fa-code-fork"></i> <span v-once="repo.forks_count"></span></div>
          <div class="repo-stat link"><a :href="repo.html_url" target="_blank" @click.stop>View on GitHub</a></div>
        </div>
      </li>
    </ul>
  </div>
  <div>
    <star-info></star-info>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import StarInfo from './star-info.vue'
import galileo from './../filters/galileo.js'

export default {
  name: 'StarList',
  components: {
    'star-info': StarInfo
  },
  computed: {
    ...mapState({
      user: 'user',
      githubStars: 'githubStars',
      currentTag: 'currentTag',
      tagFilter: 'tagFilter',
      currentStar: 'currentStar',
      searchQuery: 'tokenizedSearchQuery'
    }),
    starsWithCurrentTag() {
      return this.githubStars.filter(this.starHasCurrentTag)
    },
    starsList() {
      return galileo(this.starsWithCurrentTag, this.searchQuery)
    }
  },
  created () {
    this.$refs.repo.addEventListener('dragstart', function (e) {
      const data = JSON.stringify(e.currentTarget.dataset.index)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', data)
    }, false)

    this.$bus.$emit('STATUS', 'Loading stars...')

    this.fetchGithubStars().then((res) => {
      this.$bus.$emit('STATUS', '')
    }).catch((errors) => {
      this.$bus.$emit('STATUS', '')
      this.$bus.$emit('NOTIFICATION', 'There was an error fetching your stars from GitHub.', 'error')
    })
  },
  methods: {
    ...mapActions([
      'fetchGithubStars',
      'setCurrentStar',
      'setCurrentTag'
    ]),
    starClicked (repo) {
      if (repo.id === this.currentStar.id) {
        return false
      }
      this.setCurrentStar(repo)
      this.$bus.$emit('STAR_CHANGED')
    },
    setTag (tag) {
      this.$route.router.push(`/dashboard/tag/${tag.slug}`)
    },
    starHasCurrentTag (repo) {
      if (!Object.keys(this.currentTag).length) {
        if (this.tagFilter === 'UNTAGGED') {
          return repo.tags.length === 0
        } else {
          return true
        }
      }
      if (repo.tags.length) {
        return ~repo.tags.map(tag => tag.name).indexOf(this.currentTag.name)
      } else {
        return false
      }
    }
  }
}
</script>
