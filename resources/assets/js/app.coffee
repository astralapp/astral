riot = window.riot = require("riot")
RiotRouter = require("riot-router")
RiotControl = require("riotcontrol")
UserStore = require("./stores/userStore.coffee")
GithubStore = require("./stores/githubStore.coffee")
app = require("./tags/app.tag")

userStore = new UserStore()
githubStore = new GithubStore()

RiotControl.addStore(userStore)
RiotControl.addStore(githubStore)

Route = riot.router.Route
DefaultRoute = riot.router.DefaultRoute
NotFoundRoute = riot.router.NotFoundRoute
RedirectRoute = riot.router.RedirectRoute

riot.router.routes([
  new DefaultRoute(tag: "login-screen")
  new Route(path: '/', tag: "login-screen")
  new Route(path: '/dashboard', tag: "dashboard")
])

riot.mount("app")

riot.router.start()
