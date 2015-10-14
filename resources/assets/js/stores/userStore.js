import riot from "riot";
import {superagent as request} from "superagent";
import {lodash as _} from "lodash";

function UserStore() {
  riot.observable(this);
  this.user = {};
}
if(typeof(module) !== "undefined"){ module.exports = UserStore; }
