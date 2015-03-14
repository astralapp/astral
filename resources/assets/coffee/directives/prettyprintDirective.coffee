app.directive('syntax', ['$timeout', (timer) ->
  restrict: 'C'
  scope: true
  link: (scope, elem, attrs) ->
    scope.$watch('readme', (newVal) ->
      if newVal
        timer(doHighlight, 0)
    )
    doHighlight = ->
      elem.find('pre').addClass('prettyprint')
      prettyPrint()
    timer(doHighlight, 0)
])