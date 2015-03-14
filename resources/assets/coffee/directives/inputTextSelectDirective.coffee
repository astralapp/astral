app.directive 'textselect', ->
  restrict: 'A'
  link: ($scope, element, attrs) ->
    element.on 'click', (e) ->
      setTimeout =>
        $(@).focus().select()
      , 0
