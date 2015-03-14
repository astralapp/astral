app.directive 'dropdown', ->
  restrict: 'A'
  replace: false
  link: ($scope, element, attrs) ->
    $('html').on 'click', (e) ->
      $('[dropdown]').removeClass('dropdown-active')
    element.on 'click', (e) ->
      if $(e.target).parents('[dropdown]').length
        e.stopPropagation()
      if e.target.hasAttribute('dropdown')
        e.preventDefault()
        e.stopPropagation()
        $(@).toggleClass('dropdown-active')
    element.find('[close-dropdown]'). on 'click', (e) ->
      $(@).parents('[dropdown]').removeClass('dropdown-active')