app.factory "StarService", ($http, $q) ->
  # Get the authenticated user's stars from the DB
  getStars: ->
    stars = $http.get("/api/stars")

  # Tag a single user star
  tagStar: (obj) ->
    s = $http.post("/api/star/tag", obj)

  # Sync one or more tags to a user star
  syncTagsToStar: (star, tags) ->
    s = $http.post("/api/star/syncTags", {"star": star, "tags": tags})

  # Attach the users tags to the starred repos pulled right from GitHub's API
  attachTagsToGitHubStars: (stars, userStars) ->
    defer = $q.defer()
    userStars.forEach (s) =>
      index = _.indexOf( stars, _.findWhere(stars, { id: parseInt(s.repo_id) }) )
      if index isnt -1 and _.has(s, "tags")
        stars[index].tags = s.tags
    defer.resolve(stars)
    return defer.promise

  buildAutoTagList: (stars, tags) ->
    defer = $q.defer()
    autoTagList = []
    stars.forEach (star) =>
      if star.language # if the star has a language
        starLang = star.language.toLowerCase()
        # Temp hack so coffeescript repos will still be tagged as `javascript`
        if starLang is "coffeescript"
          starLang = "javascript"
        # Find the user's tag
        i = _.indexOf(tags, _.findWhere(tags, (tag) ->
          return tag.name.toLowerCase() is starLang
        ))
        # If tag found
        if i isnt -1
          # If it doesn't already have that tag, add that tag
          if _.indexOf(star.tags, _.findWhere(star.tags, (tag) -> return tag.name.toLowerCase() is starLang )) is -1
            tagObj =
              "repo_id": star.id
              "repo_name": star.full_name
              "tag_id": tags[i].id
            autoTagList.push(tagObj)
    if autoTagList.length > 0
      @autoTagStars( autoTagList ).then (s) =>
        defer.resolve(s)
    else
      defer.resolve(null)
    return defer.promise

  getOccurencesOfTagForStars: (stars) ->
    $http.post("/api/star/crowdtag", {"stars": stars})

  buildCrowdTagList: (stars) ->
    defer = $q.defer()
    crowdTagList = []
    starMap = _.map(stars, (star) =>
      return {"name": star.name, "id": star.id}
    )
    @getOccurencesOfTagForStars( starMap ).then (res) =>
      defer.resolve(res)
    defer.promise

  autoTagStars: (stars) ->
    $http.post("/api/star/autotag", stars)