app.directive 'setFocusIf', ['$timeout', (timer) ->
  restrict: 'A'
  link: ($scope, element, attr) ->
    $scope.$watch(attr.setFocusIf, (val) ->
      if val
        timer(->
          if $scope.$eval( attr.setFocusIf )
            $(element).find("input").focus()
        , 0, false)
    )
]