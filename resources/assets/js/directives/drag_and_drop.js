import Vue from "vue";
import dragula from "dragula";

Vue.directive("draggable", {
  bind: function(){
    this.el.setAttribute("draggable", true);
  },
  update: function(value){
    this.el.addEventListener("dragstart", function(e){
      let data = JSON.stringify(value);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", data);
    }, false);
  }
});

Vue.directive("dropzone", {
  acceptStatement: true,
  bind: function(){
  },
  update: function(fn, value){
    this.el.addEventListener("dragover", function(e){
      e.preventDefault();
      e.stopPropagation();
      e.target.classList.add("dragging");
    }, false)
    this.el.addEventListener("dragleave", function(e){
      e.preventDefault();
      e.stopPropagation();
      e.target.classList.remove("dragging")
    }, false)
    this.el.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.target.classList.remove("dragging");
      let scope = this._scope;
      let dropData = JSON.parse(e.dataTransfer.getData("text"));
      fn.apply(null, [dropData, scope]);
    }, false);
  }
});

Vue.directive("sortable", {
  params: ["sort"],
  drake: null,
  bind: function(){},
  update: function(value){
    let sortMap = [];
    if(!this.drake){
      this.drake = dragula([this.el]).on("drop", (el, target, source, sibling) => {
        sortMap = [].slice.call(source.children).map(function(el, index){
          return {
            id: el.dataset.id,
            sort_order: index
          }
        });
        this.vm[this.params.sort].apply(null, [sortMap]);
      });
    }
  },
  unbind: function(){
    this.drake.destroy();
  }
});
