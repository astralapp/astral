<template>
  <div class="tag-editor dropdown">
    <select multiple ref="tags" style="width:216px">
      <option v-if="!tags.length" value="-1"></option>
      <option v-for="tag in tags" :value="tag.name" :selected="tag.selected">{{ tag.text }}</option>
    </select>
    <button type="button" name="button" class="tag-editor--save-tags btn-flat" @click="syncTags">Save Tags</button>
  </div>
</template>
<script>
import Vue from 'vue'
import $ from 'jquery'
import 'select2'

export default {
  name: 'TagEditor',
  props: ['tags'],
  data () {
    return {
      tagsToSync: []
    }
  },
  mounted () {
    Vue.nextTick(() => {
      this.$refs.tags.select2({
        tags: true,
        tokenSeparators: [','],
        minimumInputLength: 2,
        placeholder: 'Add a tag'
      }).on('change', function () {
        const tagData = $(this).select2('data').map(function (tag) {
          return {
            name: tag.text,
            selected: true
          }
        })
      })
    })
  }
  created () {
    this.tagsToSync = this.tags.map(function (tag) {
      return {
        name: tag.text,
        selected: tag.selected
      }
    }).filter(function (tag) {
      return tag.selected
    })
  },
  destroyed () {
    $(this.$refs.tags).off().select2('destroy')
  },
  methods: {
    syncTags () {
      this.$bus.$emit('SYNC_TAGS', this.tagsToSync)
    }
  },
  events: {
    'CURRENT_TAGS_CHANGED': function (tags) {
      this.tagsToSync = tags
    }
  }
}
</script>
