app.directive('draggable', ->
  restrict: 'C'
  scope: true
  replace: false
  link: (scope, elem, attrs) ->
    elem[0].addEventListener('dragstart', (e) ->
      star = $(elem).data().$scope.$parent.star
      e.dataTransfer.setData("Text", JSON.stringify(star));
    , false)
)
app.directive('droppable', ->
  restrict: 'C'
  scope: true
  replace: false
  link: (scope, elem, attrs) ->
    elem[0].addEventListener('dragover', (e) ->
      e.preventDefault()
      $(e.target).addClass('dragging')
    , false)
    elem[0].addEventListener('dragleave', (e) ->
      $(e.target).removeClass('dragging')
    , false)
    elem[0].addEventListener('dragend', (e) ->

      $(e.target).removeClass('dragging')
    , false)
    elem[0].addEventListener('drop', (e) ->
      $(e.target).removeClass('dragging')
      currentStar = JSON.parse(e.dataTransfer.getData("Text"))
      scope.tagStar( currentStar, $(e.target).attr('data-tag-id') )
    , false)

)