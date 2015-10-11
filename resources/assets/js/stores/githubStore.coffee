riot = require("riot")
request = require("superagent")

GithubStore = ->
  riot.observable(@)

  self = @

  self.totalPages = 0
  self.cachedPages = 0
  self.stars = []

  self.getGithubStars = (page = 1) ->
    currentPage = page
    request.get("/api/github/stars?page=#{page}").end (err, res) ->
      self.stars = res.data.stars
      self.totalPages = res.data.page_count if res.data.page_count?
      self.cachedPages = res.data.cached if res.data.cached?
      if self.cachedPages and self.cachedPages is self.totalPages
        self.trigger "stars_fetched", self.stars
      else
        if self.cachedPages
          currentPage += 1
        else
          currentPage++
        if currentPage <= self.totalPages
          self.trigger "stars_fetched", self.stars
          self.getGithubStars(currentPage)
        else
          self.trigger "stars_fetched", self.stars

module.exports = GithubStore if typeof(module) isnt "undefined"
