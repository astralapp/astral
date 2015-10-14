import riot from "riot";
import RiotRouter from "riot-router";
import RiotControl from "riotcontrol";
import UserStore from "./stores/userStore.js";
import GithubStore from "./stores/githubStore.js";
import app from "./tags/app.tag";

const userStore = new UserStore();
const githubStore = new GithubStore();

RiotControl.addStore(userStore);
RiotControl.addStore(githubStore);

const Route = riot.router.Route;
const DefaultRoute = riot.router.DefaultRoute;
const NotFoundRoute = riot.router.NotFoundRoute;
const RedirectRoute = riot.router.RedirectRoute;

riot.router.routes([
  new DefaultRoute({tag: "login-screen"}),
  new Route({path: '/', tag: "login-screen"}),
  new Route({path: '/dashboard', tag: "dashboard"})
]);

riot.mount("app");

riot.router.start();
