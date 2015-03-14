app.classy.controller
  name: 'AuthController'
  inject: ['$rootScope', '$scope', '$location','$state', 'AuthService']
  init: ->

    @$.user = null
    @$.token = @$state.params.code
    @$.authError = false
    @$.authError =
      show: false
      message: ""

    unless @$.token
      @$.requestToken()
    else
      @$.login(@$.token)

  requestToken: ->
    @AuthService.requestToken().success (res) =>
      window.location.href = res.authUrl

  login: (token) ->
    @AuthService.login(token).success (user) =>
      @$rootScope.user = user
      @$state.go("dashboard")
    .error (data, status, headers, config) =>
      @$.authError.message = data.error
      @$.authError.show = true
  logout:  ->
    @AuthService.logout().success  =>
      @$rootScope.user = null
      @$state.go("home")