import Vue from "vue"
import dragula from "dragula"

Vue.directive("sortable", {
  params: ["sort"],
  drake: null,
  update: function (value) {
    let sortMap = []
    if (!this.drake) {
      this.drake = dragula([this.el]).on("drop", (el, target, source, sibling) => {
        sortMap = [].slice.call(source.children).map(function (el, index) {
          return {
            id: el.dataset.id,
            sort_order: index
          }
        })
        this.vm[this.params.sort].apply(null, [sortMap])
      })
    }
  },
  unbind: function () {
    this.drake.destroy()
  }
})
