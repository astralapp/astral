app.factory "GitHubService", ($http, $q, $timeout, StarService) ->
  totalPages: 0
  resStars: []
  defer: $q.defer()
  getStarredRepos: (page = 1) ->
    currentPage = page
    stars = $http.get("/api/github/stars?page=#{page}").then (res) =>
      if (page is 1)
        @totalPages = $.extend(true, {}, res.data).page_count;
        delete res.data.page_count
        @resStars = _.toArray(res.data)
      else
        @resStars.push( _.toArray(res.data) )
        @resStars = [].concat.apply([], @resStars)
      currentPage++
      if currentPage <= @totalPages and @totalPages isnt 0
        $timeout =>
          @defer.notify(@resStars)
          @getStarredRepos(currentPage)
        , 0
      else
        @defer.resolve(@resStars)
      return @defer.promise

  getRepoReadme: (owner, repo) ->
    readme = $http.get("/api/github/repo/#{owner}/#{repo}/readme")

  unstarStar: (star) ->
    star = $http.post('/api/github/unstar', star)
