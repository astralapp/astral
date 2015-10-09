riot = require("riot")
RiotControl = require("riotcontrol")
UserStore = require("./stores/userStore.coffee")
GithubStore = require("./stores/githubStore.coffee")
app = require("./tags/app.tag")

userStore = new UserStore()
githubStore = new GithubStore()

RiotControl.addStore(userStore)
RiotControl.addStore(githubStore)

riot.mount("app")
