<dropdown>
  <div class="dropdown" hide={true}>
    <ul class="dropdown-list">
      <li><a >Settings</a></li>
      <li><a href="mailto:hello@astralapp.com">Support &amp; Feedback</a></li>
      <li><a href="https://gratipay.com/syropian/" target="_blank"><i class="fa fa-heart"></i> Gratipay</a></li>
      <li><a ng-href="/logout">Sign Out</a></li>
    </ul>
  </div>

  self = @
  self.on "mount", ->
    $("#{opts.trigger}").on "click", (e) ->
      $("#{self.root}").children(".dropdown").show()

</dropdown>
