import Vue from "vue";
import $ from "jquery";
import select2 from "select2";
Vue.directive("tag-select", {
  params: ["autocomplete"],
  bind: function(){
    // $(this.el).select2({
    //   tags: true,
    //   data: this.params.autocomplete,
    //   tokenSeparators: [","],
    //   minimumInputLength: 2,
    //   placeholder: "Add a tag"
    // });
  },
  update: function(value){
    setTimeout( () => {
      $(this.el).select2({
        tags: true,
        data: this.params.autocomplete,
        tokenSeparators: [","],
        minimumInputLength: 2,
        placeholder: "Add a tag",
        dropdownAutoWidth: true
      });
    }, 0);
  },
  unbind: function(){
    $(this.el).off().select2("destroy")
  }
});
