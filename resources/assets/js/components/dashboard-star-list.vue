<template>
  <div class="dashboard-repos">
    <ul class="repos">
      <li class="repo" v-for="repo in githubStars | currentTagFilter | galileo" track-by="id" v-draggable="repo" @click="starClicked($index)">
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
  <star-info></star-info>
</template>
<script>
import Vue from "vue";
import { intersection } from "lodash";
import store from "../store/store.js";
import dnd from "./../directives/drag_and_drop.js";
import StarInfo from "./star-info.vue";
export default {
  name: "StarList",
  data() {
    return {}
  },
  computed: {
    githubStars() {
      return store.state.githubStars;
    },
    stars() {
      return store.state.stars;
    },
    currentTag() {
      return store.state.currentTag;
    },
    searchQuery(){
      return store.state.tokenizedSearchQuery;
    }
  },
  ready() {
    store.actions.fetchStars();
    store.actions.fetchGithubStars();
  },
  methods: {
    starClicked(index){
      let star = this.githubStars[index];
      store.actions.setCurrentStar(star);
      store.actions.fetchReadme(star.full_name);
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
    },
    setCurrentTag(tag){
      store.actions.setCurrentTag( tag );
    }
  },
  filters: {
    currentTagFilter(arr) {
      if( !Object.keys(this.currentTag).length ){
        return arr;
      }
      return arr.filter( (repo) => {
        let matchedStar = this.stars.filter( (star) => {
          return star.repo_id === repo.id;
        })[0];
        if( matchedStar && matchedStar.tags.length ){
          return ~matchedStar.tags.map( (tag) => {
            return tag.name;
          }).indexOf(this.currentTag.name);
        }
        else {
          return false;
        }
      });
    },
    galileo(arr){
      let query = this.searchQuery;
      //If there's no query return all items
      if( query.query.replace(/\s/g, "") === "" ){
        return arr;
      }

      //Begin the filter process
      return arr.filter( (repo) => {
        let searchText = `${repo.full_name} ${repo.hasOwnProperty("description") ? repo.description : ""}`.toLowerCase();
        // If theres tags in the search query we have to bind the star to the repo
        if( query.tags.length ){
          let matchedStar = this.stars.filter( (star) => {
            return star.repo_id === repo.id;
          })[0];
          //If star matched and it has tags
          if( matchedStar && matchedStar.tags.length ){
            let matchedTags = matchedStar.tags.map( (tag) => {
              return tag.name.toLowerCase();
            });
            let hasTags =  intersection(query.tags, matchedTags).length === query.tags.length;
            let hasStrings = ~searchText.indexOf( query.strings.join(" ").toLowerCase() );
            return hasTags && hasStrings;
          }
        }
        //Just search the repo text and/or description
        else {
          return ~searchText.indexOf( query.strings.join(" ").toLowerCase() );
        }
      });
    }
  },
  components: {
    "star-info": StarInfo
  }
};
</script>
