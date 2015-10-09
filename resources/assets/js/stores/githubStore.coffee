riot = require("riot")
request = require("superagent")
_ = require("lodash")

GithubStore = ->
  riot.observable(@)

  self = @

  self.stars = []

module.exports = GithubStore if typeof(module) isnt "undefined"
