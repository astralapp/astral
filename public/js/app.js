var app;

app = angular.module('astral', ['classy', 'ngAnimate', 'ui.router']);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
  $httpProvider.interceptors.push(function($q, $rootScope, $location, $injector) {
    return {
      responseError: function(response) {
        if (response.status === 401) {
          $injector.get("$state").go("auth");
        }
        return $q.reject(response);
      }
    };
  });
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise("/");
  return $stateProvider.state("home", {
    url: "/",
    templateUrl: "templates/index.html"
  }).state("auth", {
    url: "/auth?authenticated",
    templateUrl: "templates/auth.html",
    controller: "AuthController"
  }).state("dashboard", {
    url: "/dashboard",
    templateUrl: "templates/dashboard.html",
    controller: "DashboardController"
  });
});

app.run(function($rootScope, $http, CSRF_TOKEN, $urlRouter, $state, $templateCache) {
  $http.defaults.headers.common['Authorization'] = CSRF_TOKEN;
  return $rootScope.$on('$routeChangeStart', function(event, next, current) {
    if (typeof current !== 'undefined') {
      return $templateCache.remove(current.templateUrl);
    }
  });
});

app.factory("AuthService", function($http) {
  return {
    authorize: function() {
      return window.location.href = '/api/auth';
    },
    fetchUser: function() {
      var user;
      return user = $http.get("/api/auth/user");
    }
  };
});

app.factory("GitHubService", function($http, $q, $timeout) {
  return {
    totalPages: 0,
    cachedPages: 0,
    resStars: [],
    defer: $q.defer(),
    getStarredRepos: function(page) {
      var currentPage, stars;
      if (page == null) {
        page = 1;
      }
      currentPage = page;
      return stars = $http.get("/api/github/stars?page=" + page).then((function(_this) {
        return function(res) {
          _this.resStars = res.data.stars;
          if (res.data.page_count != null) {
            _this.totalPages = res.data.page_count;
          }
          if (res.data.cached != null) {
            _this.cachedPages = res.data.cached;
          }
          if (_this.cachedPages && _this.cachedPages === _this.totalPages) {
            _this.defer.resolve(_this.resStars);
            return _this.defer.promise;
          } else {
            if (_this.cachedPages) {
              currentPage += 1;
            } else {
              currentPage++;
            }
            if (currentPage <= _this.totalPages) {
              $timeout(function() {
                _this.defer.notify(_this.resStars);
                return _this.getStarredRepos(currentPage);
              }, 0);
            } else {
              _this.defer.resolve(_this.resStars);
            }
            return _this.defer.promise;
          }
        };
      })(this));
    }
  };
});

app.classy.controller({
  name: "AuthController",
  inject: ["$rootScope", "$scope", "$location", "$state", "$stateParams", "AuthService"],
  data: {
    user: null,
    token: null,
    authError: {
      visible: false,
      message: ""
    }
  },
  init: function() {
    if (this.$state.current.name === "auth") {
      if (!this.$stateParams.authenticated) {
        return this.authorize();
      } else {
        return this.setRootUser();
      }
    }
  },
  methods: {
    authorize: function() {
      return this.AuthService.authorize();
    },
    setRootUser: function() {
      return this.AuthService.fetchUser().success((function(_this) {
        return function(user) {
          _this.$rootScope.user = user;
          return _this.$state.go("dashboard");
        };
      })(this)).error((function(_this) {
        return function(data, status, headers, config) {
          _this.authError.message = data.error;
          return _this.authError.visible = true;
        };
      })(this));
    },
    logout: function() {
      return this.AuthService.logout().success((function(_this) {
        return function() {
          _this.$rootScope.user = null;
          return _this.$state.go("home");
        };
      })(this));
    }
  }
});

app.classy.controller({
  name: "DashboardController",
  inject: ["$rootScope", "$scope", "$location", "$state", "$sce", "$timeout", "$http", "AuthService", "GitHubService"],
  data: {
    stars: {
      data: []
    },
    tags: {
      data: []
    }
  },
  init: function() {
    return this.AuthService.fetchUser().then((function(_this) {
      return function(user) {
        _this.$rootScope.user = user.data;
        return _this.$timeout(function() {
          return _this.getStars();
        }, 0);
      };
    })(this));
  },
  methods: {
    getStars: function() {
      return this.GitHubService.getStarredRepos().then(((function(_this) {
        return function(stars) {
          return _this.stars.data = stars;
        };
      })(this)), ((function(_this) {
        return function(error) {
          return console.log(error);
        };
      })(this)), (function(_this) {
        return function(resStars) {
          return _this.stars.data = resStars;
        };
      })(this));
    }
  }
});
