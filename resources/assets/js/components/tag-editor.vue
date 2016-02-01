<template>
  <div class="tag-editor dropdown">
    <select multiple v-tag-select style="width:216px">
      <option v-if="!tags.length" value="-1"></option>
      <option v-for="tag in tags" :value="tag.name" :selected="tag.selected">{{ tag.text }}</option>
    </select>
    <button type="button" name="button" class="tag-editor--save-tags btn-flat" @click="syncTags">Save Tags</button>
  </div>
</template>
<script>
import Vue from "vue";
import store from "../store/store.js";
import "../directives/tag-select.js";
export default {
  name: "TagEditor",
  props: ["tags"],
  data(){
    return {
      tagsToSync: []
    }
  },
  computed: {
    tagList(){
      return this.tags.map(function(tag){
        return {id: tag.id, text: tag.name };
      });
    }
  },
  ready(){
    this.tagsToSync = this.tags;
  },
  methods: {
    syncTags(){
      this.$dispatch("SYNC_TAGS", this.tagsToSync);
    }
  },
  events: {
    "CURRENT_TAGS_CHANGED": function(tags){
      this.tagsToSync = tags;
    }
  }
}
</script>
