riot = require("riot")
request = require("superagent")
_ = require("lodash")

UserStore = ->
  riot.observable(@)

  self = @

  self.user = {}

module.exports = UserStore if typeof(module) isnt "undefined"
