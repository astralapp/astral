app.directive('closeonescape', ["$timeout", (timer) ->
  restrict: "A"
  replace: false
  scope: true
  link: (scope, element, attrs) ->
    $('body').on "keyup", (e) ->
      if e.keyCode is 27
        e.preventDefault()
        timer(hideModal, 0)
    hideModal = ->
      scope.hideUserSettings()
])