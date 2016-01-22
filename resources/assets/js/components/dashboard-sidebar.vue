<template>
  <div class="dashboard-sidebar">
    <div class="dashboard-sidebar-header">
      <h3>Astral</h3>
    </div>
    <div class="sidebar-header">
      <h3 class="sidebar-header-text">Stars</h3>
    </div>
    <ul class="dashboard-list sidebar-stars">
      <li class="all-stars dashboard-list-item" @click="clearCurrentTag"><i class="fa fa-inbox"></i> All Stars</li>
      <li class="untagged-stars dashboard-list-item"><i class="fa fa-star-o"></i> Untagged Stars</li>
    </ul>
    <div class="sidebar-header tags-header">
      <h3 class="sidebar-header-text">Tags</h3>
      <div class="tag-button-group">
        <button class="tag-button-group-item">Add</button>
        <button class="tag-button-group-item">Edit</button>
        <button class="tag-button-group-item">Sort</button>
      </div>
    </div>
    <form class="tag-form" v-show="true" @submit.prevent="addTag">
      <input type="text" name="name" v-model="newTag.name" placeholder="Tag name">
      <button type="submit">Save</button>
    </form>
    <ul class="dashboard-list sidebar-tags" v-sortable="tags" sort="reorderTags">
      <li class="dashboard-list-item tag" v-for="tag in tags" track-by="id" v-dropzone="tagStar" :data-id="tag.id" @click="setCurrentTag(tag)">
        <i class="fa fa-tag"></i>
        <span class="tag-name">{{ tag.name }}</span>
        <span class="tagged-count" v-if="tag.hasOwnProperty('stars') && tag.stars.length">{{tag.stars.length}}</span>
      </li>
    </ul>
  </div>
</template>
<script>
import Vue from "vue";
import store from "../store/store.js";
import dnd from "./../directives/drag_and_drop.js";

export default {
  name: "DashboardSidebar",
  computed: {
    newTag(){ return store.state.newTag },
    tags(){ return store.state.tags },
  },
  ready(){
    store.actions.fetchTags()
  },
  methods: {
    addTag: function(){
      store.actions.addTag();
    },
    tagStar: function(data, scope){
      let starData = {
        repoId: data.id,
        repoName: data.full_name,
        tagId: scope.tag.id
      }
      store.actions.tagStar(starData);
    },
    reorderTags: function(sortMap){
      store.actions.reorderTags(sortMap);
    },
    setCurrentTag: function(tag){
      store.actions.setCurrentTag( tag );
    },
    clearCurrentTag: function() {
      store.actions.resetCurrentTag();
    }
  }
}
</script>
