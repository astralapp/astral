<template>
  <div class="dashboard-editTagTrigger" @click.self="tagEditorShowing = !tagEditorShowing" v-on-clickaway="hideTagEditor">
    <i class="fa fa-cog"></i>
    <transition name="dashboardHeader-editTagDropdown">
      <div class="dashboardHeader-editTagDropdown" v-show="tagEditorShowing">
        <input type="text" v-model="currentTagField">
        <button class="btn-flat" @click="doEditTagName(currentTag.id)">Save</button>
        <button class="btn-flat btn-danger" @click="deleteCurrentTag">Delete Tag</button>
      </div>
    </transition>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { mixin as clickaway } from 'vue-clickaway'

export default {
  name: 'EditTagDropdown',
  mixins: [clickaway],
  data () {
    return {
      currentTagField: Object.assign({}, this.$store.state.tags.currentTag).name,
      tagEditorShowing: false
    }
  },
  computed: {
    ...mapGetters([
      'currentTag'
    ])
  },
  methods: {
    ...mapActions([
      'editTagName',
      'deleteTag'
    ]),
    hideTagEditor () {
      this.tagEditorShowing = false
    },
    doEditTagName (id) {
      const name = this.currentTagField
      this.editTagName({ id, name }).then((res) => {
        this.$bus.$emit('NOTIFICATION', `Tag renamed to ${name}.`)
        this.$router.replace(`/dashboard/tag/${res.slug}`)
      }).catch((errors) => {
        if (errors.name) {
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
          this.$router.push('/dashboard')
        }).catch((errors) => {
          this.$bus.$emit('STATUS', '')
          this.$bus.$emit('NOTIFICATION', 'There was an error deleting this tag.', 'error')
        })
      }
    }
  }
}
</script>
