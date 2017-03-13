<template>
  <div class="dashboard-editTagTrigger" @click.self="tagEditorShowing = !tagEditorShowing" v-on-clickaway="tagEditorShowing = false">
    <i class="fa fa-cog"></i>
    <transition name="dashboardHeader-editTagDropdown">
      <div class="dashboardHeader-editTagDropdown" v-show="tagEditorShowing">
        <input type="text" :value="currentTag.name" ref="tag-name">
        <button class="btn-flat" @click="doEditTagName(currentTag.id)">Save</button>
        <button class="btn-flat btn-danger" @click="deleteCurrentTag">Delete Tag</button>
      </div>
    </transition>
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex'
import { mixin as clickaway } from 'vue-clickaway'

export default {
  name: 'EditTagDropdown',
  mixins: [clickaway],
  data () {
    return {
      currentTagName: '',
      tagEditorShowing: false
    }
  },
  computed: {
    ...mapState([
      'currentTag'
    ])
  },
  methods: {
    ...mapActions([
      'editTagName',
      'deleteTag'
    ]),
    doEditTagName (id) {
      const name = this.$refs.tagName.value
      this.editTagName(id, name).then((res) => {
        this.$bus.$emit('NOTIFICATION', `Tag renamed to ${name}.`)
        this.$route.router.replace(`/dashboard/tag/${res.slug}`)
      }).catch((errors) => {
        if (errors.name){
          this.$bus.$emit('NOTIFICATION', errors.name[0], 'error')
        } else {
          this.$bus.$emit('NOTIFICATION', 'There was an error renaming this tag.', 'error')
        }
      })
    },
    deleteCurrentTag () {
      if (window.confirm('Are you sure you want to delete this tag?')) {
        this.$bus.$emit('STATUS', `Deleting ${this.currentTag.name} tag...`)
        this.deleteTag(this.currentTag.id).then((res) => {
          this.$bus.$emit('STATUS', '')
          this.$bus.$emit('NOTIFICATION', `${this.currentTag.name} tag successfully deleted.`)
          this.$route.router.push('/dashboard')
        }).catch((errors) => {
          this.$bus.$emit('STATUS', '')
          this.$bus.$emit('NOTIFICATION', 'There was an error deleting this tag.', 'error')
        })
      }
    }
  }
}
</script>
