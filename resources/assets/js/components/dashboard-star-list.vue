<template>
  <div class="dashboard-repos">
    <ul class="repos">
      <li class="repo" v-for="repo in githubStars | galileo" track-by="id" v-draggable="repo" @click="starClicked(repo)" :class="{ 'active': currentStar.id == repo.id }" v-if="starHasCurrentTag(repo)">
        <h3 class="repo-name">{{* repo.full_name }}</h3>
        <div class="repo-description">{{* repo.description }}</div>
        <ul class="repo-tags">
          <li v-for="tag in repo.tags" track-by="slug" @click.stop="setTag(tag)">
            {{ tag.name }}
          </li>
        </ul>
        <div class="repo-stats">
          <div class="repo-stat stars"><i class="fa fa-star"></i> {{* repo.stargazers_count }}</div>
          <div class="repo-stat forks"><i class="fa fa-code-fork"></i> {{* repo.forks_count }}</div>
          <div class="repo-stat link"><a href="{{* repo.html_url }}" target="_blank">View on GitHub</a></div>
        </div>
      </li>
    </ul>
  </div>
  <div>
    <star-info></star-info>
  </div>
</template>
<script>
import { user } from "../store/getters/userGetters"
import { githubStars } from "../store/getters/githubGetters"
import { stars, currentStar } from "../store/getters/starsGetters"
import { currentTag } from "../store/getters/tagsGetters"
import { tokenizedSearchQuery } from "../store/getters/galileoGetters"
import {
  fetchStars,
  fetchGithubStars,
  setCurrentStar,
  setCurrentTag
} from "../store/actions"
import StarInfo from "./star-info.vue"
import "./../filters/galileo.js"
import "./../directives/drag_and_drop.js"

export default {
  name: "StarList",
  vuex: {
    getters: {
      user,
      githubStars,
      currentTag,
      currentStar,
      stars,
      searchQuery: tokenizedSearchQuery
    },
    actions: {
      fetchStars,
      fetchGithubStars,
      setCurrentStar,
      setCurrentTag
    }
  },
  ready () {
    this.$root.$broadcast("STATUS", "Loading stars...")
    this.fetchStars()
    this.fetchGithubStars().then((res) => {
      this.$root.$broadcast("STATUS", "")
    }).catch((errors) => {
      this.$root.$broadcast("STATUS", "")
      this.$root.$broadcast("NOTIFICATION", "There was an error fetching your stars from GitHub.", "error")
    })
  },
  methods: {
    starClicked (repo) {
      this.setCurrentStar(repo)
      this.$broadcast("STAR_CHANGED")
    },
    setTag (tag) {
      this.$route.router.go(`/dashboard/tag/${tag.slug}`)
    },
    starHasCurrentTag (repo) {
      if (!Object.keys(this.currentTag).length) {
        return true
      }
      if (repo.tags.length) {
        return ~repo.tags.map(function (tag) {
          return tag.name
        }).indexOf(this.currentTag.name)
      } else {
        return false
      }
    }
  },
  components: {
    "star-info": StarInfo
  }
}
</script>
