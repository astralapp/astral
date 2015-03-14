app.directive('spinner', ->
  restrict: 'E'
  template: '<div class="loader"></div>'
  replace: true
  link: ($scope, element, attrs) ->
    opts =
      lines: 13
      length: 2
      width: 2
      radius: 5
      corners: 1
      rotate: 0
      direction: 1
      color: attrs.color
      speed: 1
      trail: 60
      shadow: false
      hwaccel: true
      className: 'spinner'
      zIndex: 98
      top: attrs.top || '50%'
      left: attrs.left || '50%'
    spinner = new Spinner(opts).spin( $(element)[0] )
)