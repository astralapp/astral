app.classy.controller
  name: "AuthController"
  inject: ["$rootScope", "$scope", "$location","$state", "$stateParams","AuthService"]
  data:
    user: null
    token: null
    authError:
      visible: false
      message: ""

  init: ->
    if @$state.current.name is "auth"
      unless @$stateParams.authenticated
        @authorize()
      else
        @setRootUser()

  methods:
    authorize: ->
      @AuthService.authorize()

    setRootUser: ->
      @AuthService.fetchUser().success (user) =>
        @$rootScope.user = user
        @$state.go("dashboard")
      .error (data, status, headers, config) =>
        @authError.message = data.error
        @authError.visible = true

    logout:  ->
      @AuthService.logout().success  =>
        @$rootScope.user = null
        @$state.go("home")
