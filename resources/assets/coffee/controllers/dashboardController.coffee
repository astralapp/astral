app.classy.controller
  name: "DashboardController"
  inject: [
    "$rootScope",
    "$scope",
    "$location",
    "$state",
    "$sce",
    "$timeout",
    "$http",
    "AuthService",
    "GitHubService"
  ]
  data:
    stars:
      data: []
    tags:
      data: []  
  init: ->
    @AuthService.fetchUser().then (user) =>
      @$rootScope.user = user.data
      @$timeout =>
        @getStars() # get all users stars from GitHub
        # @$.getUserStars() # get all users stars from the DB
        # @$.getTags() # get all users tags
      , 0
  methods:
    getStars: ->
      @GitHubService.getStarredRepos().then ((stars) =>
        @stars.data = stars
      ), ((error) =>
        console.log error
      ), (resStars) =>
        @stars.data = resStars
