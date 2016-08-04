<template>
  <div class="dashboard-editTagTrigger" @click.self="tagEditorShowing = !tagEditorShowing" v-on-clickaway="tagEditorShowing = false">
    <i class="fa fa-cog"></i>
    <div class="dashboardHeader-editTagDropdown" v-show="tagEditorShowing" transition="dashboardHeader-editTagDropdown">
      <input type="text" v-model="currentTagField">
      <button class="btn-flat" @click="doEditTagName(currentTag.id, currentTagName)">Save</button>
      <button class="btn-flat btn-danger">Delete Tag</button>
    </div>
  </div>
</template>
<script>
import { currentTag } from "../store/getters/tagsGetters"
import { editTagName } from "../store/actions"
import { mixin as clickaway } from "vue-clickaway"

export default {
  name: "EditTagDropdown",
  mixins: [clickaway],
  vuex: {
    getters: {
      currentTag
    },
    actions: {
      editTagName
    }
  },
  data () {
    return {
      currentTagName: "",
      tagEditorShowing: false
    }
  },
  computed: {
    currentTagField: {
      get () {
        if (this.currentTagName.replace(/\s/g, "") === "") {
          return this.currentTag.name
        } else {
          return this.currentTagName
        }
      },
      set (newValue) {
        this.currentTagName = newValue
      }
    }
  },
  methods: {
    doEditTagName (id, name) {
      this.editTagName(id, name).then((res) => {
        this.$root.$broadcast("NOTIFICATION", `Tag renamed to ${name}.`)
        this.$route.router.replace(`/dashboard/${res.slug}`)
      }).catch((errors) => {
        this.$root.$broadcast("NOTIFICATION", "There was an error renaming this tag.", "error")
      })
    }
  }
}
</script>
