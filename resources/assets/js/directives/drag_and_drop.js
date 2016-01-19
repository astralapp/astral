import Vue from "vue";

Vue.directive("draggable", {
  bind: function(){
    this.el.setAttribute("draggable", true);
  },
  update: function(value){
    this.el.addEventListener("dragstart", function(e){
      let tag = JSON.stringify(value);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", tag);
    }, false);
  }
});

Vue.directive("dropzone", {
  bind: function(){
  },
  update: function(value){
    this.el.addEventListener("dragover", function(e){
      e.preventDefault();
      e.stopPropagation();
    }, false)
    this.el.addEventListener("drop", function(e){
      e.preventDefault();
      e.stopPropagation();
      let tag = JSON.parse(e.dataTransfer.getData("text"));
      console.log(tag);
    }, false);
  }
});
