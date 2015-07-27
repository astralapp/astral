app.factory "AuthService", ($http) ->
  authorize: ->
    # login = $http.get('/api/auth')
    window.location.href = '/api/auth'
  fetchUser: ->
    user = $http.get("/api/auth/user")
  # logout: ->
  #   logout = $http.get('/api/auth/logout')
