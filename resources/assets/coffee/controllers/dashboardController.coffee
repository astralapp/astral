app.classy.controller
  name: 'DashboardController'
  inject: [
    '$rootScope',
    '$scope',
    '$location',
    '$state',
    '$sce',
    '$timeout',
    '$http',
    'GitHubService',
    'StarService',
    'TagService',
    'UserService',
    'AuthService'
  ]
  init: ->
    ### Scope Vars ###
    # The current flash message
    @$.flash =
      "message": null
      "type": "success"
      "active": false

    @$.loadingStatus =
      "message": null
      "active": false

    @$.exportingData = false

    @$.stars = [] # Users starred repos directly from GitHub
    @$.totalPages = 0 # How many pages of starred repos returned from the GitHub API
    @$.userStars = [] # User stars stored in the db
    @$.currentStar = null # Currently selected repo

    @$.tags = []
    @$.currentTag = null # Currently selected sidebar tag
    @$.currentStarTags = [] # Tags for the currently selected repo
    @$.addingTag = false # Bool to show/hide tag form on sidebar
    @$.addingTags = false # Bool to show/hide tag form on detail view
    # New tag object
    @$.newTag =
      "name": ""

    @$.readme = null # Currently selected repo's readme
    @$.readmeLoading = false

    @$.untaggedFilter = false

    # State Params
    @$.tagParam = @$state.params.tag

    @$.repoSearchText = ""
    @$.userSettings =
      "active": false

    ### Init Functions ###
    # Before we do anything, authenticate the user
    @AuthService.getUser().then (user) =>
      @$rootScope.user = user.data
      @$timeout =>
        @$.getStars() # get all users stars from GitHub
        @$.getUserStars() # get all users stars from the DB
        @$.getTags() # get all users tags
      , 0
    # Sortable
    @$.sortableOptions =
      update: (e, ui) =>
        @$timeout =>
          @TagService.reorder(@$.tags).success (tags) ->
            @$.tags = tags
        , 0

  showFlash: (msg, type = "success", duration = 4250) ->
    @$.flash =
      "message": msg
      "type": type
      "active": true
    if duration isnt -1
      timer = @$timeout =>
        @$.hideFlash()
      , duration

  hideFlash: ->
    @$.flash.active = false

  showUserSettings: ->
    @$.userSettings.active = true

  hideUserSettings: ->
    @$.userSettings.active = false

  showUpgradeView: ->
    @$.userSettings.upgradeView = true

  hideUpgradeView: ->
    @$.userSettings.upgradeView = false

  setLoadingStatus: (status) ->
    @$.loadingStatus.message = status
    @$.loadingStatus.active = true

  hideLoadingStatus: ->
    @$.loadingStatus.active = false

  getStars: ->
    @$.setLoadingStatus("Loading Stars...")
    @GitHubService.getStarredRepos().then ((stars) =>
      @$.stars = stars
      @$.attachTagsToGitHubStars()
      if @$rootScope.user.autotag
        @$.setLoadingStatus("Auto-tagging Stars...")
        @StarService.buildAutoTagList(stars, @$.tags).then (s) =>
          @$.hideLoadingStatus()
          unless s is null
            @$.userStars = s.data
            @$timeout =>
              @$.getTags()
              @$.attachTagsToGitHubStars()
              if @$rootScope.user.crowdtag
                @$.setLoadingStatus("Crowd-tagging Stars...")
                @StarService.buildCrowdTagList(stars).then (s2) =>
                  @$.hideLoadingStatus()
                  unless s2 is null
                    @$.userStars = s2.data
                    @$.getTags()
                    @$.attachTagsToGitHubStars()
              else
                @$.hideLoadingStatus()
            , 0

      else
        if @$rootScope.user.crowdtag
          @$.setLoadingStatus("Crowd-tagging Stars...")
          @StarService.buildCrowdTagList(stars).then (s2) =>
            @$.hideLoadingStatus()
            unless s2 is null
              @$.userStars = s2.data
              @$.getTags()
              @$.attachTagsToGitHubStars()
        else
          @$.hideLoadingStatus()
    ), ((error) =>
      @$.showFlash('Error retrieving stars', 'error')
    ), (resStars) =>
        @$.stars = resStars
        @$.attachTagsToGitHubStars()

  setCurrentStar: (star) ->
    @$.currentStar = star
    @$.getRepoReadme(star.owner.login, star.name)
    @$.getTagsForCurrentStar()

  getUserStars: (attachTags = false) ->
    @StarService.getStars().success (stars) =>
      @$.userStars = stars
      if attachTags
        @$timeout =>
          @$.attachTagsToGitHubStars()
        , 0

  unstarStar: (index) ->
    @GitHubService.unstarStar(@$.currentStar).success (res) =>
      @$.userStars = res
      @$.getTags()
      @$.stars.splice(index, 1)
      @$.currentStar = null
      @$.readme = null
      @$scope.$apply()


  setCurrentTag: (tag) ->
    @$.untaggedFilter = false
    if tag
      @$.currentTag = tag
      @$state.transitionTo("tag", {tag: tag.slug}, { location: true, inherit: true, relative: @$state.$current, notify: false })
    else
      @$.currentTag = null
      @$state.transitionTo("dashboard", {}, { location: true, inherit: true, relative: @$state.$current, notify: false })

  updateCurrentTagName: ->
    if @$.currentTag.name
      @TagService.rename(@$.currentTag.id, @$.currentTag).success (tags) =>
        @$.tags = tags
        @$.getTagsForCurrentStar()
        @$.showFlash("Tag renamed to #{@$.currentTag.name}")
    else
      @$.showFlash("Tag name cannot be blank.", "error")

  deleteCurrentTag: ->
    tagName = @$.currentTag.name
    @TagService.delete(@$.currentTag.id).success (tags) =>
      @$.tags = tags
      @$.currentTag = null
      @$.getUserStars(true)
      @$.showFlash("#{tagName} was deleted")

  getRepoReadme: (owner, repo) ->
    @$.readmeLoading = true
    @GitHubService.getRepoReadme(owner, repo).success (res) =>
      @$.readmeLoading = false
      @$.readme = @$sce.trustAsHtml(res.readme)
      $('.dashboard-repo-details').scrollTop(0)
    .error (err) =>
      @$.readme = null
      @$.readmeLoading = false

  toggleSidebarTagEditor: ->
    @$.addingTag = !@$.addingTag

  getTags: ->
    @TagService.fetchAll().success (tags) =>
      if @$.tagParam
        mappedTag = _.findWhere(tags, {slug: @$.tagParam})
        if mappedTag
          @$.setCurrentTag(mappedTag)
      @$.tags = tags

  getTagsForCurrentStar: ->
    @$.currentStarTags = []
    clonedStar = $.extend(true, {}, @$.currentStar);
    @$.currentStarTags = clonedStar.tags

  fetchTagsForAutoComplete: (query) ->
    return @$http.get("/api/tags?query=#{query}")

  addTag: ->
    if @$.newTag.name
      @TagService.create(@$.newTag).success (tag) =>
        @$.tags.push(tag)
        @$.showFlash("#{tag.name} created successfully")
        @$.newTag.name = ""
    else
      @$.showFlash("Tag name cannot be blank.", "error")

  tagStar: (star, tagId, showNotification = true) ->
    obj =
      "repo_id": star.id
      "repo_name": star.full_name
      "tag_id": tagId
    @StarService.tagStar(obj).success (tags) =>
      @$.tags = tags
      @$.getUserStars(true)
      tag = _.findWhere(@$.tags, {id: parseInt(tagId)})
      tagName = tag.name
      if showNotification
        @$.showFlash("#{star.full_name} added to #{tagName}")

  syncTagsToStar: ->
    star = @$.currentStar
    @StarService.syncTagsToStar(star, @$.currentStarTags).success (stars) =>
      @$.userStars = stars
      @$.getTags()
      @$.toggleTagEditor()
      @$timeout =>
        @$.attachTagsToGitHubStars()
      , 0

  sortTags: (sorter) ->
    if sorter is "alpha"
      @$.tags = _.sortBy(@$.tags, (tag) =>
        tag.name.toLowerCase()
      )
    else
      @$.tags = _.sortBy(@$.tags, (tag) =>
        tag.stars.length * -1
      )
    @$timeout =>
      @TagService.reorder(@$.tags).success (tags) ->
        @$.tags = tags
    , 0

  attachTagsToGitHubStars: ->
    @StarService.attachTagsToGitHubStars(@$.stars, @$.userStars).then (stars) =>
      @$.stars = stars
      @$.getTagsForCurrentStar()
      window.starz = @$.stars



  starHasCurrentTag: (star) ->
    found = false
    tagArray = []
    if @$.currentTag
      _.forEach(star.tags, (tag) =>
        found = true if tag.slug is @$.currentTag.slug
      )
    else
      found = true
    return found

  filterByUntagged: ->
    @$.currentTag = null
    @$.untaggedFilter = true

  repoSearch: (star) ->
    if @$.repoSearchText[0] is "#" and @$.repoSearchText.indexOf(":") is -1
      return _.findIndex( star.tags, (tag) =>
        return tag.name.toLowerCase().indexOf(@$.repoSearchText.replace('#', '').toLowerCase()) > -1
      ) > -1
    searchArray = @$.repoSearchText.split(':')
    tagMatches = _.filter(searchArray, (i) ->
      return i[0] is "#"
    )
    stringMatch = _.filter(searchArray, (i) ->
      return i[0] isnt "#"
    ).join(':').toLowerCase()

    if tagMatches.length > 0
      tags = _.map(tagMatches, (tag) ->
        return tag.replace('#', '').toLowerCase()
      )
      starHasTags = _.filter(star.tags, (t) -> return _.contains(tags, t.name.toLowerCase())).length is tags.length
      if star.description
        searchString = "#{star.full_name.toLowerCase()} #{star.description.toLowerCase()}"
      else
        searchString = star.full_name.toLowerCase()
      return starHasTags and searchString.indexOf( stringMatch ) > -1
    else
      if not @$.repoSearchText? or @$.repoSearchText.replace(/\s/g, "") is ""
        return true
      else
        if star.description
          searchString = "#{star.full_name.toLowerCase()} #{star.description.toLowerCase()}"
        else
          searchString = star.full_name.toLowerCase()
        return searchString.indexOf( @$.repoSearchText.toLowerCase() ) > -1

  untagged: (star) ->
    if not @$.currentTag and @$.untaggedFilter
      return !star.hasOwnProperty('tags')
    else
      return true

  toggleTagEditor: ->
    @$.addingTags = !@$.addingTags


  updateAutotagSetting: (bool) ->
    checked =  bool
    @UserService.updateAutotag(checked).then (res) =>
      @$rootScope.user = res.data

  updateCrowdtagSetting: (bool) ->
    checked =  bool
    @UserService.updateCrowdtag(checked).then (res) =>
      @$rootScope.user = res.data

  exportData: ->
    @$.exportingData = true
    window.location = "/api/user/settings/exportData"

  watch:
    '{object}currentTag': (newValue, oldValue) ->
      if @$.currentTag
        if newValue.name is "" then newValue.name = "Unnamed Tag"
        if newValue and oldValue
          if newValue.id is oldValue.id and newValue.name isnt oldValue.name
            taggedStars = _.filter(@$.stars, (star) ->
              return _.where(star.tags, {name: oldValue.name}).length > 0
            )
            taggedStars.forEach (star) =>
              index = _.indexOf( @$.stars, _.findWhere(@$.stars, {id: star.id}) )
              tagIndex = _.indexOf(@$.stars[index].tags, _.findWhere(@$.stars[index].tags, {name: oldValue.name}))
              @$.stars[index].tags[tagIndex].name = newValue.name
