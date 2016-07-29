import Vue from "vue"
import Vuex from "vuex"
import user from "./modules/user"
import github from "./modules/github.js"
import stars from "./modules/stars.js"
import tags from "./modules/tags.js"
import galileo from "./modules/galileo.js"

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    github,
    stars,
    tags,
    galileo
  }
})
