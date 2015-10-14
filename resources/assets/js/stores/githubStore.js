import riot from "riot";
import {superagent as request} from "superagent";

function GithubStore() {
  riot.observable(this);

  this.totalPages = 0;
  this.cachedPages = 0;
  this.stars = [];

  this.getGithubStars = (page=1) => {
    let currentPage = page;
    request.get("/api/github/stars?page=#{page}").end((err, res) => {
      this.stars = res.data.stars
      if(res.data.page_count) {this.totalPages = res.data.page_count;}
      if(res.data.cached) {this.cachedPages = res.data.cached;}
      if(this.cachedPages && this.cachedPages === this.totalPages) {
        this.trigger("stars_fetched", this.stars);
      }
      else {
        currentPage++;
      }
      if(currentPage <= this.totalPages) {
        this.trigger("stars_fetched", this.stars);
        this.getGithubStars(currentPage)
      }
      else {
        this.trigger("stars_fetched", this.stars);
      }
    });
  }
}

if(typeof(module) !== "undefined") { module.exports = GithubStore; }
