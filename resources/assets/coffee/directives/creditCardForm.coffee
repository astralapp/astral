app.directive 'ccform', ->
  restrict: 'A'
  link: ($scope, element, attrs) ->
    $ccNumber = $(element).find('.cc-number')
    $ccExpDate = $(element).find('.cc-exp-date')
    $ccCVC = $(element).find('.cc-cvc')
    $ccNumber.payment('formatCardNumber')
    $ccExpDate.payment('formatCardExpiry')
    $ccCVC.payment('formatCardCVC')
    element.on("submit", =>
      expDate = $ccExpDate.payment('cardExpiryVal')
      expMonth = expDate["month"].toString()
      expYear = expDate["year"].toString()
      console.log $ccNumber.val().toString()
      $scope.userSettings.ccErrors = []
      ccErrors = []
      unless $.payment.validateCardNumber( $ccNumber.val() )
        ccErrors.push("Invalid card number")
      unless $.payment.validateCardExpiry( expMonth, expYear )
        ccErrors.push("Invalid expiry")
      unless $.payment.validateCardCVC( $ccCVC.val() )
        ccErrors.push("Invalid CVC")
      $scope.userSettings.ccErrors = ccErrors
      $scope.$apply()
    )
