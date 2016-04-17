<template>
  <div class="dashboard-sidebar">
    <div class="dashboard-sidebar-header">
      <h3>Astral</h3>
    </div>
    <div class="sidebar-header">
      <h3 class="sidebar-header-text">Stars</h3>
    </div>
    <ul class="dashboard-list sidebar-stars">
      <li class="all-stars dashboard-list-item" @click="resetTag" :class="{ 'selected': noCurrentTag }"><i class="fa fa-inbox"></i> All Stars</li>
      <li class="untagged-stars dashboard-list-item"><i class="fa fa-star-o"></i> Untagged Stars</li>
    </ul>
    <div class="sidebar-header tags-header">
      <h3 class="sidebar-header-text">Tags</h3>
      <div class="tag-button-group">
        <button class="tag-button-group-item" @click="addTagFormShowing = !addTagFormShowing">Add</button>
        <button class="tag-button-group-item">Edit</button>
        <button class="tag-button-group-item">Sort</button>
      </div>
    </div>
    <form class="tag-form" v-show="addTagFormShowing" @submit.prevent="addTag">
      <input type="text" name="name" v-model="newTag.name" placeholder="Tag name">
      <button type="submit">Save</button>
    </form>
    <ul class="dashboard-list sidebar-tags" v-sortable="tags" sort="reorderTags">
      <li class="dashboard-list-item tag" v-for="tag in tags" track-by="id" v-dropzone="tagStarWithData" :data-id="tag.id" @click="setTag(tag)" :class="{ 'selected': currentTag.id == tag.id }">
        <i class="fa fa-tag"></i>
        <span class="tag-name">{{ tag.name }}</span>
        <span class="tagged-count" v-if="tag.hasOwnProperty('stars') && tag.stars.length">{{tag.stars.length}}</span>
      </li>
    </ul>
  </div>
</template>
<script>
import Vue from "vue";
import { newTag, tags, currentTag } from "../store/getters/tagsGetters";
import {
  fetchTags,
  addTag,
  tagStar,
  reorderTags,
  setCurrentTag,
  resetCurrentTag
} from "../store/actions";
import dnd from "./../directives/drag_and_drop.js";

export default {
  name: "DashboardSidebar",
  vuex: {
    getters: {
      newTag,
      tags,
      currentTag
    },
    actions: {
      fetchTags,
      addTag,
      tagStar,
      reorderTags,
      setCurrentTag,
      resetCurrentTag
    }
  },
  data(){
    return {
      addTagFormShowing: false
    }
  },
  computed: {
    noCurrentTag(){
      return !Object.keys(this.currentTag).length
    }
  },
  ready(){
    this.fetchTags().then(() => {
      if(this.$route.params.tag){
        let tag = this.tags.find( (tag) => {
          return tag.slug === this.$route.params.tag;
        });
        if(tag){
          this.setCurrentTag(tag);
        }
      }
    });
  },
  methods: {
    tagStarWithData: function(data, scope){
      let starData = {
        repoId: data.id,
        repoName: data.full_name,
        tagId: scope.tag.id
      }
      this.tagStar(starData);
    },
    setTag: function(tag){
      this.setCurrentTag(tag);
      this.$route.router.replace(`/dashboard/${tag.slug}`);
    },
    resetTag: function(){
      this.resetCurrentTag()
      this.$route.router.replace("/dashboard");
    }
  }
}
</script>
