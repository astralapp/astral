app.factory "UserService", ($http) ->
  updateAutotag: (bool) ->
    $http.post("/api/user/settings/autotag", {checked: bool})
  updateCrowdtag: (bool) ->
    $http.post("/api/user/settings/crowdtag", {checked: bool})
  exportData: ->
    $http.get("/api/user/settings/exportData")