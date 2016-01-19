<template>
  <div class="dashboard-sidebar">
    <div class="dashboard-sidebar-header">
      <h3>Astral</h3>
    </div>
    <div class="sidebar-header">
      <h3 class="sidebar-header-text">Stars</h3>
    </div>
    <ul class="dashboard-list sidebar-stars">
      <li class="all-stars dashboard-list-item"><i class="fa fa-inbox"></i> All Stars</li>
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
    <ul class="dashboard-list sidebar-tags">
      <li class="dashboard-list-item tag droppable" v-for="tag in tags">{{ tag.name }}</li>
    </ul>
  </div>
</template>
<script>
import tagStore from "./../stores/tagStore.js";

export default {
  name: "DashboardSidebar",
  computed: {
    newTag(){ return tagStore.state.newTag },
    tags(){ return tagStore.state.tags },
  },
  ready(){
    tagStore.actions.fetchTags()
  },
  methods: {
    addTag: function(){
      tagStore.actions.addTag();
    }
  }
}
</script>
