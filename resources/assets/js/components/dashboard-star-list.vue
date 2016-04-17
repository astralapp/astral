<template>
  <div class="dashboard-repos">
    <ul class="repos">
      <li class="repo" v-for="repo in githubStars | currentTagFilter | galileo" track-by="id" v-draggable="repo" @click="starClicked(repo)" :class="{ 'active': currentStar.id == repo.id }">
        <h3 class="repo-name">{{* repo.full_name }}</h3>
        <div class="repo-description">{{* repo.description }}</div>
        <ul class="repo-tags">
          <li v-for="tag in starTags(repo)" track-by="id" @click.stop="setCurrentTag(tag)">
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
import Vue from "vue";
import { githubStars } from "../store/getters/githubGetters";
import { stars, currentStar } from "../store/getters/starsGetters";
import { currentTag } from "../store/getters/tagsGetters";
import { tokenizedSearchQuery } from "../store/getters/galileoGetters";
import {
  fetchStars,
  fetchGithubStars,
  fetchReadme,
  setCurrentStar,
  setCurrentTag,
} from "../store/actions";
import { intersection } from "lodash";
import dnd from "./../directives/drag_and_drop.js";
import currentTagFilter from "./../filters/currentTag.js";
import galileo from "./../filters/galileo.js";
import StarInfo from "./star-info.vue";
export default {
  name: "StarList",
  vuex: {
    getters: {
      githubStars,
      currentTag,
      currentStar,
      stars,
      searchQuery: tokenizedSearchQuery
    },
    actions: {
      fetchStars,
      fetchGithubStars,
      fetchReadme,
      setCurrentStar,
      setCurrentTag,
    }
  },
  ready() {
    this.fetchStars();
    this.fetchGithubStars();
  },
  methods: {
    starClicked(repo){
      this.setCurrentStar(repo);
      this.fetchReadme(repo.full_name);
      this.$broadcast("STAR_CHANGED");
    },
    starTags(repo){
      let matchedStar = this.stars.filter( (star) => {
        return star.repo_id === repo.id;
      })[0];
      if( matchedStar && matchedStar.tags.length ){
        return matchedStar.tags;
      }
      else {
        return [];
      }
    }
  },
  components: {
    "star-info": StarInfo
  }
}
</script>
