app.directive 'triggerOnEnter', ['$timeout', (timer) ->
  restrict: 'A'
  link: ($scope, element, attr) ->
    $(document).keydown (e) =>
      timer(->
          if $scope.$eval( attr.triggerOnEnter ) and e.keyCode is 13
            $(element).trigger("click")
      , 0, false)
]