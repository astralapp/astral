app.classy.controller
  name: 'UpgradeController'
  inject: [
    '$rootScope',
    '$scope',
    '$location',
    '$routeParams',
    '$sce',
    '$timeout',
    '$http',
    'UserService',
    'AuthService'
  ]
  init: ->
    console.log "Init"