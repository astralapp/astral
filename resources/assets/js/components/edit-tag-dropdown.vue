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
<style>
.dashboard-editTagTrigger {
  @include transition ( color 150ms linear );
  color: lighten($dark-blue, 30%);
  cursor: pointer;
  display: inline-block;
  font-size: 0.9rem;
  line-height: 1;
  margin-left: 5px;
  margin-right: 10px;
  position: relative; top: -3px;
  &:hover {
    color: lighten($dark-blue, 15%);
  }
  .fa { pointer-events: none; }
}
.dashboardHeader-editTagDropdown {
  @include transition ( all 250ms ease );
  @include transform( translate(-50%, -10px) );
  background: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(#373570, 0.1);
  border-radius: 3px;
  box-shadow: 0 1px 1px rgba(0,0,0,0.08);
  margin-top: 10px;
  opacity: 0;
  pointer-events: none;
  position: absolute; top: 100%; left: 50%;
  z-index: 999;
  padding: 10px;
  width: 200px;
  &::before {
    @include transform( translateX(-50%) rotate(45deg) );
    @include size( 12px );
    background: #fff;
    background-clip: padding-box;
    border-top: 1px solid rgba(#373570, 0.1);
    border-left: 1px solid rgba(#373570, 0.1);
    content: '';
    position: absolute; top: -6px; left: 50%;
    z-index: 99;
  }
  @include transform( translate(-50%, 0) );
  opacity: 1;
  pointer-events: auto;
  input[type=text] {
    @include textfield();
    @include size( 100% 34px );
  }
  button {
    display: block;
    font-size: 0.7rem;
    letter-spacing: 0.08rem;
    line-height: 1;
    margin-top: 5px;
    padding: 0.58rem;
    text-transform: uppercase;
    width: 100%;
  }
}
</style>
