app.factory "TagService", ($http, $sanitize) ->
  create: (name) ->
    tag = $http.post("/api/tags", name)
  fetchAll: ->
    tags = $http.get('/api/tags')
  rename: (id, tag) ->
    tags = $http.put("/api/tags/#{id}", tag)
  reorder: (tagCollection) ->
    sortHash = []
    for i in [0..tagCollection.length - 1] by 1
      o = {}
      o["#{tagCollection[i].id}"] = i
      sortHash.push o
    tags = $http.post("/api/tags/reorder", {"sortHash": sortHash})
  delete: (id) ->
    tags = $http.delete("/api/tags/#{id}")