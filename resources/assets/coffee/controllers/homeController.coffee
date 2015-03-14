app.classy.controller
  name: 'HomeController'
  inject: ['$rootScope', '$scope', '$location', '$routeParams', 'AuthService']
  init: ->

    @$.user = null
    @$.token = @$routeParams.code
    @$.authError = @$routeParams.error
    @$.autoSignIn = @$routeParams.autoSignIn
    @$.loggingIn = false
    @$.authError =
      show: false
      message: ""

    if @$.autoSignIn
      @$.requestToken()
    if @$location.path() is '/auth'
      @$.loggingIn = true
      if @$.token
        @$.login(@$.token)
      else if @$.authError
        console.log "Authentication Error"

    if @$location.path() is '/logout'
      @$.logout()
  requestToken: ->
    @$.loggingIn = true
    @AuthService.requestToken().success (res) =>
      window.location.href = res.authUrl

  login: (token) ->
    @AuthService.login(token).success (user) =>
      @$rootScope.user = user
      @$location.url('/dashboard')
    .error (data, status, headers, config) =>
      @$.loggingIn = false
      @$.authError.message = data.error
      @$.authError.show = true
  logout:  ->
    @AuthService.logout().success  =>
      @$rootScope.user = null
      @$location.url('/')