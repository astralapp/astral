app.factory "GitHubService", ($http, $q, $timeout) ->
  totalPages: 0
  cachedPages: 0
  resStars: []
  defer: $q.defer()
  getStarredRepos: (page = 1) ->
    currentPage = page
    stars = $http.get("/api/github/stars?page=#{page}").then (res) =>
      @resStars = res.data.stars
      @totalPages = res.data.page_count if res.data.page_count?
      @cachedPages = res.data.cached if res.data.cached?
      if @cachedPages and @cachedPages is @totalPages
        @defer.resolve(@resStars)
        return @defer.promise
      else
        if @cachedPages
          currentPage += 1
        else
          currentPage++
        if currentPage <= @totalPages
          $timeout =>
            @defer.notify(@resStars)
            @getStarredRepos(currentPage)
          , 0
        else
          @defer.resolve(@resStars)
        return @defer.promise
