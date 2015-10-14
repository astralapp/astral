const riot = require("riot");
const request = require("superagent");
const _ = require("lodash");

UserStore = () => {
  riot.observable(this);
  self = this;
  self.user = {};
}
if(typeof(module) !== "undefined"){ module.exports = UserStore; }
