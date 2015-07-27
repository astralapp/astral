app = angular.module 'astral', [
  'classy',
  'ngAnimate',
  'ui.router'
  # 'ngSanitize'
  # 'localytics.directives',
  # 'ngTagsInput',
  # 'ui.sortable',
]
app.config ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) ->
  $httpProvider.interceptors.push ($q, $rootScope, $location, $injector) ->
    responseError: (response) ->
      # Intercept unauthorised API responses and fire an event.
      if response.status is 401
        $injector.get("$state").go("auth")
      $q.reject response
  $locationProvider.html5Mode(true)
  $urlRouterProvider.otherwise("/")
  $stateProvider.state("home",
    url: "/"
    templateUrl: "templates/index.html"
  )
  .state("auth",
    url: "/auth?authenticated"
    templateUrl: "templates/auth.html"
    controller: "AuthController"
  )
  .state("dashboard",
    url: "/dashboard"
    templateUrl: "templates/dashboard.html"
    controller: "DashboardController"
  )
app.run ($rootScope, $http, CSRF_TOKEN, $urlRouter, $state, $templateCache) ->
  $http.defaults.headers.common['Authorization'] = CSRF_TOKEN
  $rootScope.$on '$routeChangeStart', (event, next, current) ->
    if typeof current isnt 'undefined'
      $templateCache.remove current.templateUrl
