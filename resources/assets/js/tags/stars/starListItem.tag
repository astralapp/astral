<star-list-item>
  <li class="repo draggable" each={new Array(10)}>
    <h3 class="repo-name">astralapp/astral</h3>
    <div class="repo-description">Organize your GitHub stars with ease</div>
    <ul class="repo-tags" ng-show="star.tags">
      <li each={new Array(3)}>Foo</li>
    </ul>
    <div class="repo-stats">
      <div class="repo-stat stars"><i class="fa fa-star"></i> 1337</div>
      <div class="repo-stat forks"><i class="fa fa-code-fork"></i> 1337</div>
      <div class="repo-stat link"><a href="http://github.com/astralapp/astral" target="_blank">View on GitHub</a></div>
    </div>
  </li>
</star-list-item>
