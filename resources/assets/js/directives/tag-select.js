import Vue from "vue"
import $ from "jquery"
import "select2"

Vue.directive("tag-select", {
  update: function (value) {
    const self = this
    if ($(this.el).data("select2")) {
      $("[data-select2-tag]").remove()
    }
    setTimeout(() => {
      $(this.el).select2({
        tags: true,
        tokenSeparators: [","],
        minimumInputLength: 2,
        placeholder: "Add a tag"
      }).on("change", function () {
        const tagData = $(this).select2("data").map(function (tag) {
          return { name: tag.text }
        })
        self.vm.$dispatch("CURRENT_TAGS_CHANGED", tagData)
      })
    }, 0)
  },
  unbind: function () {
    $(this.el).off().select2("destroy")
  }
})
