<template>
  <div class="dashboard-editTagTrigger" v-if="currentTagExists()" @click.self="tagEditorShowing = !tagEditorShowing">
    <i class="fa fa-cog"></i>
    <div class="dashboardHeader-editTagDropdown" v-show="tagEditorShowing">
      <input type="text" v-model="currentTagField">
      <button class="btn-flat" @click="editTagName(currentTag.id, currentTagName)">Save</button>
      <button class="btn-flat btn-danger">Delete Tag</button>
    </div>
  </div>
</template>
<script>
import { currentTag } from "../store/getters/tagsGetters";
import { editTagName } from "../store/actions";
export default {
  name: "EditTagDropdown",
  vuex: {
    getters: {
      currentTag
    },
    actions: {
      editTagName
    }
  },
  data(){
    return {
      currentTagName: "",
      tagEditorShowing: false
    }
  },
  computed: {
    currentTagField: {
      get(){
        if( this.currentTagName.replace(/\s/g, "") === "" ){
          return this.currentTag.name;
        } else {
          return this.currentTagName;
        }

      },
      set(newValue){
        this.currentTagName = newValue;
      }
    }
  },
  methods: {
    currentTagExists(){
      return this.currentTag.id !== -1;
    }
  },
}
</script>
