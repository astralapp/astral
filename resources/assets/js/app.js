import riot from "riot";
import * as RiotRouter from "riot-router";
import RiotControl from "riotcontrol";
import GithubStore from "./stores/githubStore.js";

import "./tags/app.tag";

const githubStore = new GithubStore();

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
