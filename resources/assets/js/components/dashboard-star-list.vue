<template>
  <div class="dashboard-repos">
    <ul class="repos">
      <li class="repo draggable" v-for="star in stars" v-dropzone>
        <h3 class="repo-name">{{* star.full_name }}</h3>
        <div class="repo-description">{{* star.description }}</div>
        <ul class="repo-tags">
          <li v-for="tag in star.tags">{{ tag.name }}</li>
        </ul>
        <div class="repo-stats">
          <div class="repo-stat stars"><i class="fa fa-star"></i> {{* star.stargazers_count }}</div>
          <div class="repo-stat forks"><i class="fa fa-code-fork"></i> {{* star.forks_count }}</div>
          <div class="repo-stat link"><a href="{{* star.html_url }}" target="_blank">View on GitHub</a></div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import Vue from "vue";
import githubStore from "./../stores/githubStore.js";
import dnd from "./../directives/drag_and_drop.js";
export default {
  name: "StarList",
  data() {
    return {}
  },
  computed: {
    stars() {
      return githubStore.state.stars;
    }
  },
  ready() {
    githubStore.actions.fetchStars()
  },
  methods: {
    logTag: function(tag){
      console.log(tag);
    }
  }
}
</script>
