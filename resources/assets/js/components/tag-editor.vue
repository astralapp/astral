<template>
  <div class="tag-editor dropdown">
    <select multiple v-tag-select="tags" :autocomplete="tagList" style="width:216px">
      <option v-if="!tags.length" value="-1"></option>
      <option v-for="tag in tags" :value="$index" selected>{{ tag.name }}</option>
    </select>
    <button type="button" name="button" class="tag-editor--save-tags btn-flat" @click="syncTags">Save Tags</button>
  </div>
</template>
<script>
import Vue from "vue";
import store from "../store/store.js";
import "../directives/tag-select.js";
import Autocomplete from "./autocomplete.vue";
export default {
  name: "TagEditor",
  props: ["tags", "placeholder"],
  data: function(){
    return {
      newTag: ""
    }
  },
  computed: {
    tagList(){
      return store.state.tags.map(function(tag){
        return tag.name;
      });
    }
  },
  ready(){
  },
  methods: {
    syncTags(){
      this.$dispatch("SYNC_TAGS", this.tags);
    }
  },
  components: {
    "autocomplete": Autocomplete
  }
}
</script>
