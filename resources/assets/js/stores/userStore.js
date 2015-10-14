const riot = require("riot");
const request = require("superagent");
const _ = require("lodash");

const UserStore = () => {
  riot.observable(this);
  const self = this;
  self.user = {};
}
if(typeof(module) !== "undefined"){ module.exports = UserStore; }
