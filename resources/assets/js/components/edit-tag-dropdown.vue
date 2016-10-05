<template>
  <div class="dashboard-editTagTrigger" @click.self="tagEditorShowing = !tagEditorShowing" v-on-clickaway="tagEditorShowing = false">
    <i class="fa fa-cog"></i>
    <div class="dashboardHeader-editTagDropdown" v-show="tagEditorShowing" transition="dashboardHeader-editTagDropdown">
      <input type="text" :value="currentTag.name" v-el:tag-name>
      <button class="btn-flat" @click="doEditTagName(currentTag.id)">Save</button>
      <button class="btn-flat btn-danger" @click="deleteCurrentTag">Delete Tag</button>
    </div>
  </div>
</template>
<script>
import { currentTag } from "../store/getters/tagsGetters"
import { editTagName, deleteTag } from "../store/actions"
import { mixin as clickaway } from "vue-clickaway"

export default {
  name: "EditTagDropdown",
  mixins: [clickaway],
  vuex: {
    getters: {
      currentTag
    },
    actions: {
      editTagName,
      deleteTag
    }
  },
  data () {
    return {
      currentTagName: "",
      tagEditorShowing: false
    }
  },
  methods: {
    doEditTagName (id) {
      const name = this.$els.tagName.value
      this.editTagName(id, name).then((res) => {
        this.$root.$broadcast("NOTIFICATION", `Tag renamed to ${name}.`)
        this.$route.router.replace(`/dashboard/tag/${res.slug}`)
      }).catch((errors) => {
        if (errors.name){
          this.$root.$broadcast("NOTIFICATION", errors.name[0], "error")
        } else {
          this.$root.$broadcast("NOTIFICATION", "There was an error renaming this tag.", "error")
        }
      })
    },
    deleteCurrentTag () {
      if (window.confirm("Are you sure you want to delete this tag?")) {
        this.$root.$broadcast("STATUS", `Deleting ${this.currentTag.name} tag...`)
        this.deleteTag(this.currentTag.id).then((res) => {
          this.$root.$broadcast("STATUS", "")
          this.$root.$broadcast("NOTIFICATION", `${this.currentTag.name} tag successfully deleted.`)
          this.$route.router.go("/dashboard")
        }).catch((errors) => {
          this.$root.$broadcast("STATUS", "")
          this.$root.$broadcast("NOTIFICATION", "There was an error deleting this tag.", "error")
        })
      }
    }
  }
}
</script>
