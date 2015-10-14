const riot = require("riot");
const request = require("superagent");

const GithubStore = () =>
  riot.observable(this);

  self = this;

  self.totalPages = 0;
  self.cachedPages = 0;
  self.stars = [];

  self.getGithubStars = (page = 1) => {
    let currentPage = page;
    request.get("/api/github/stars?page=#{page}").end((err, res) => {
      self.stars = res.data.stars
      if(res.data.page_count) {self.totalPages = res.data.page_count;}
      if(res.data.cached) {self.cachedPages = res.data.cached;}
      if(self.cachedPages && self.cachedPages === self.totalPages) {
        self.trigger("stars_fetched", self.stars);
      }
      else {
        currentPage++;
      }
      if(currentPage <= self.totalPages) {
        self.trigger("stars_fetched", self.stars);
        self.getGithubStars(currentPage)
      }
      else {
        self.trigger("stars_fetched", self.stars);
      }
    });
  }

if(typeof(module) !== "undefined") { module.exports = GithubStore; }
