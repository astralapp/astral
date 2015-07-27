app.factory "GitHubService", ($http, $q, $timeout) ->
  totalPages: 0
  resStars: []
  defer: $q.defer()
  getStarredRepos: (page = 1) ->
    currentPage = page
    console.log page
    stars = $http.get("/api/github/stars?page=#{page}").then (res) =>
      @totalPages = res.data.page_count if res.data.page_count?
      if page is 1
        # Are we receiving cached data?
        if res.data.cached
          @resStars = res.data.stars
          #If we've cached all stars, resolve the promise
          if res.data.cached is @totalPages
            @defer.resolve(@resStars)
          # If not, set the currentPage to however many pages we've cached, plus one
          else
            currentPage = res.data.cached + 1
            $timeout =>
              @defer.notify(@resStars)
              @getStarredRepos(currentPage)
            , 0
        else
          @resStars = res.data.stars
      else
        @resStars = res.data.stars
      currentPage++
      if currentPage <= @totalPages and @totalPages isnt 0
        $timeout =>
          @defer.notify(@resStars)
          @getStarredRepos(currentPage)
        , 0
      else
        @defer.resolve(@resStars)
      return @defer.promise
