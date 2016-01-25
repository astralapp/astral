<template>
  <div class="tag-editor dropdown">
    <span class="tag-editor--measure" @style="
    {
      display: 'none',
      visibility:'hidden',
      width: 'auto',
      whiteSpace: 'pre'
    }
    "
    >{{ measureString }}</span>
    <div class="tag-editor--host">
      <ul class="tag-editor--tags-list">
        <li class="tag-editor--tag" v-for="tag in tags">
          <span class="tag-editor--tag-name">{{ tag.name }}</span>
          <span class="tag-editor--delete-tag" @click="deleteTag($index, false)">&times;</span>
        </li>
      </ul>
      <input type="text" :placeholder="placeholder" v-model="newTag" @keyup="resizeInput" @keyup.188="addTag" @keyup.8="deleteTag(tags.length - 1, true)" @keydown="inputKeydown" class="tag-editor--input">
    </div>
    <button type="button" name="button" class="tag-editor--save-tags btn-flat" @click="syncTags">Save Tags</button>
  </div>
</template>
<script>
import Vue from "vue";
export default {
  name: "TagEditor",
  props: ["tags", "autocomplete", "placeholder"],
  data: function(){
    return {
      newTag: "",
      canDelete: false,
    }
  },
  computed: {
    measureString(){
      if(this.newTag.replace(/\s/g, "") === ""){
        return this.placeholder;
      }
      else {
        return this.newTag;
      }
    }
  },
  ready(){
    document.querySelector(".tag-editor--measure").style.display = "none";
  },
  methods: {
    addTag(e){
      if(this.newTag.replace(/\s/g, "") !== "" && this.newTag.replace(/\s/g, "") !== "," && !this._hasModifierKey(e)){
        this.tags.push({name: this.newTag.slice(0, -1)});
        this.newTag = "";
      }
    },
    deleteTag(index, usingKeyboard){
      if( usingKeyboard ){
        if( !this.canDelete ){
          return false;
        }
      }
      this.tags.splice(index, 1);
    },
    inputKeydown(){
      this.deleteCheck();
      this.resizeInput();
    },
    deleteCheck(){
      this.canDelete = this.newTag.replace(/\s/g, "") === ""
    },
    resizeInput(){
      let $measurer = document.querySelector(".tag-editor--measure");
      let $input = document.querySelector(".tag-editor--input");
      $measurer.style.display = "";
      let width = $measurer.offsetWidth + 5 + 3;
      $measurer.style.display = "none";
      $input.style.width = `${width}px`;
    },
    _hasModifierKey(event){
      return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
    },
    syncTags(){
      this.$dispatch("SYNC_TAGS", this.tags);
    }
  }
}
</script>
<style>
.tag-editor {
  background: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(55,53,112,0.1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border-radius: 6px;
  margin: 20px 0 0 20px;
  padding: 15px;
  position: absolute;
  width: 250px;
}
.tag-editor:before {
  transform: translateX(-50%) rotate(45deg);
  background: #fff;
  background-clip: padding-box;
  border-top: 1px solid rgba(55,53,112,0.1);
  border-left: 1px solid rgba(55,53,112,0.1);
  content: "";
  position: absolute; top: -6px; left: 50%;
  width: 12px; height: 12px;
  z-index: 99;
}
.tag-editor--host{
  background: #fcfcfc;
  background-clip: padding-box;
  border-radius: 3px;
  border: 1px solid rgba(0,0,0,0.15);
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
  cursor: text;
  overflow: hidden;
  padding: 1px;
  word-wrap: break-word;
}
.tag-editor--tags-list {
  list-style-type: none;
  margin: 0; padding: 0;
}
.tag-editor--tag {
  background: #708EA3;
  border-radius: 3px;
  color: #fff;
  float: left;
  font-size: 0.8rem;
  font-weight: bold;
  height: 26px;
  line-height: 25px;
  margin: 2px;
  padding: 0 5px;
  display: inline-block;
}
.tag-editor--delete-tag {
  cursor: pointer;
  font-size: 1rem;
  margin-left: 5px;
  vertical-align: middle;
  line-height: normal;
  position: relative; top: -1px;
}
.tag-editor--input{
  appearance: none;
  border: none;
  float: left;
  font-size: 0.8rem;
  height: 30px;
  margin-left: 5px;
  padding: 0;
  outline: 0;
  width: 77px;
}
.tag-editor--save-tags {
  clear: left;
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.08rem;
  line-height: 1;
  margin-top: 15px;
  padding: 0.58rem;
  text-transform: uppercase;
  width: 100%;
}
</style>
