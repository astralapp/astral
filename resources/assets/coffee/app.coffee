app = angular.module 'astral', [
  'classy',
  'ngRoute',
  'ngSanitize'
  'ngAnimate',
  'localytics.directives',
  'ngTagsInput',
  'ui.sortable',
]

app.config ($routeProvider, $locationProvider, $httpProvider) ->
  $httpProvider.interceptors.push ($q, $rootScope, $location) ->
    responseError: (response) ->
      console.log response
      # Intercept unauthorised API responses and fire an event.
      if response.status is 401
        $location.url('/?autoSignIn=true')
      $q.reject response

  $locationProvider.html5Mode(true)
  $routeProvider.when '/',
    templateUrl: 'templates/index.html'
    controller: 'HomeController'
  .when '/auth',
    templateUrl: 'templates/index.html'
    controller: 'HomeController'
  .when '/login',
    templateUrl: 'templates/index.html'
    controller: 'HomeController'
  .when '/logout',
    templateUrl: 'templates/index.html'
    controller: 'HomeController'
  .when '/dashboard',
    templateUrl: 'templates/dashboard.html'
    controller: 'DashboardController'
  .when '/upgrade',
    templateUrl: 'templates/upgrade.html'
    controller: 'UpgradeController'
  $routeProvider.otherwise({ redirectTo: '/' })

app.run ($rootScope, $http, CSRF_TOKEN) ->
  $http.defaults.headers.common['Authorization'] = CSRF_TOKEN
