<template>
  <div class="tag-editor">
    <span class="tag-editor--measure" @style="
    {
      display: 'none',
      visibility:'hidden',
      width: 'auto',
      whiteSpace: 'pre'
    }
    "
    ></span>
    <div class="tag-editor--host">
      <ul class="tag-editor--tags-list">
        <li class="tag-editor--tag" v-for="tag in tags">
          <span class="tag-editor--tag-name">{{ tag }}</span>
          <span class="tag-editor--delete-tag" @click="deleteTag($index, false)">&times;</span>
        </li>
      </ul>
      <input type="text" placeholder="Add a tag" v-model="newTag" @keyup="resizeInput" @keyup.188="addTag" @keyup.8="deleteTag(tags.length - 1, true)" @keydown="inputKeydown" class="tag-editor--input">
    </div>
    <button type="button" name="button" class="tag-editor--save-tags">Save Tags</button>
  </div>
</template>
<script>
import Vue from "vue";
export default {
  name: "TagEditor",
  props: ["tags", "autocomplete"],
  data: function(){
    return {
      newTag: "",
      canDelete: false
    }
  },
  ready(){
    this.resizeInput();
  },
  methods: {
    addTag(){
      if(this.newTag.replace(/\s/g, "") !== "" && this.newTag.replace(/\s/g, "") !== ","){
        this.tags.push(this.newTag.slice(0, -1));
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
      let placeholder = $input.getAttribute("placeholder");
      let width = 0;
      if($input.value.replace(/\s/g, "") !== ""){
        $measurer.textContent = $input.value;
      }
      else {
        $measurer.textContent = placeholder;
      }
      $measurer.style.display = "";
      width = $measurer.offsetWidth + 5 + 3;
      $measurer.style.display = "none";
      $input.style.width = `${width}px`;
      $input.scrollLeft = 0
    }
  }
}
</script>
<style>
.tag-editor {
  background: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border-radius: 6px;
  margin: 20px 0 0 20px;
  padding: 10px;
  width: 400px;
}
.tag-editor--host{
  cursor: text;
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
  height: 30px;
  margin-left: 5px;
  padding: 0;
  outline: 0;
}
.tag-editor--save-tags{
  clear: left;
  display: block!important;
  margin-top: 50px;
  width: 100%;
}
</style>
