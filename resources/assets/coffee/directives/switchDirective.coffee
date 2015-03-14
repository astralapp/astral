app.directive('switch', ->
  restrict: 'E'
  template: '<div class="switch"><input type="checkbox" id="{{id}}" ng-transclude></input><label for="{{id}}" ng-transclude></label></div>'
  replace: true
  transclude: true
  scope:
    id: "@"
  link: ($scope, element, attrs) ->
    $scope.$watch('$root.user', (newVal) ->
      if newVal
        checkedExpr = $scope.$parent.$eval(attrs.checked)
        element.children('input[type=checkbox]').attr('checked', 'checked') if checkedExpr
    )
    element.removeAttr('id checked change')
    checkedExpr = $scope.$parent.$eval(attrs.checked)
    element.children('input[type=checkbox]').attr('checked', 'checked') if checkedExpr
    element.children('input[type=checkbox]').on "change", (e) =>
      $scope.$parent.$eval(attrs.change) if attrs.change

)