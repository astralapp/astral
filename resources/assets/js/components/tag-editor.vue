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
import "../directives/tag-select.js"

export default {
  name: "TagEditor",
  props: ["tags"],
  data () {
    return {
      tagsToSync: []
    }
  },
  ready () {
    this.tagsToSync = this.tags.map(function (tag) {
      return {
        name: tag.text,
        selected: tag.selected
      }
    }).filter(function (tag) {
      return tag.selected
    })
  },
  methods: {
    syncTags () {
      this.$dispatch("SYNC_TAGS", this.tagsToSync)
    }
  },
  events: {
    "CURRENT_TAGS_CHANGED": function (tags) {
      this.tagsToSync = tags
    }
  }
}
</script>
