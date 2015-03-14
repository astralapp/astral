app.factory "AuthService", ($http) ->
  requestToken: ->
    login = $http.get('/api/auth/login')
  login: (token) ->
    login = $http.get("/api/auth/login?code=#{token}")
  getUser: ->
    user = $http.get("/api/auth/user")
  logout: ->
    logout = $http.get('/api/auth/logout')