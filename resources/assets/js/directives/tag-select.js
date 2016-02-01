import Vue from "vue";
import $ from "jquery";
import select2 from "select2";
Vue.directive("tag-select", {
  bind: function(){
  },
  update: function(value){
    let self = this;
    if( $(this.el).data("select2") ){
      $(this.el).select2().trigger("change");
    }
    setTimeout( () => {
      $(this.el).select2({
        tags: true,
        tokenSeparators: [","],
        minimumInputLength: 2,
        placeholder: "Add a tag",
      }).on("change", function(){
        let tagData = $(this).select2("data").map(function(tag){ return {name: tag.text} });
        self.vm.$dispatch("CURRENT_TAGS_CHANGED", tagData);
      });
    }, 0);
  },
  unbind: function(){
    $(this.el).off().select2("destroy")
  }
});
