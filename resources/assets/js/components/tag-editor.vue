<template>
  <div class="tag-editor dropdown">
    <select multiple v-tag-select="tags" style="width:216px">
      <option v-if="!tags.length" value="-1"></option>
      <option v-for="tag in tags" :value="tag.name" :selected="tag.selected">{{ tag.text }}</option>
    </select>
    <button type="button" name="button" class="tag-editor--save-tags btn-flat" @click="syncTags">Save Tags</button>
  </div>
</template>
<script>
import Vue from "vue";
import "../directives/tag-select.js";
export default {
  name: "TagEditor",
  props: ["tags"],
  data(){
    return {
      tagsToSync: []
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
<style>
.select2-dropdown {
  background: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(#000, 0.08);
  box-shadow: 0 1px 3px rgba(#000, 0.05);
}
.select2-results__option {
  font-size: 0.9rem;
  padding: 10px;
  &:last-child {
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  }
}
.select2-container--default .select2-results__option--highlighted[aria-selected] {
  background: lighten($dark-blue, 30%);
  color: #fff;
}
</style>
