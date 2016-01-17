import riot from "riot";
import request from "superagent";

function GithubStore() {

  this.totalPages = 0;
  this.cachedPages = 0;
  this.stars = [];

  this.on("request:stars", () => {
    this.getGithubStars();
  });

  this.on("request:readme", (repo) => {
    this.getRepoReadme(repo);
  });

  this.getGithubStars = (page=1) => {
    let currentPage = page;
    request.get("/api/github/stars?page=" + page).end((err, res) => {
      if(res.error) {
        if(err.status === 401) {
          window.location("/");
        }
      }
      res = JSON.parse(res.text);
      this.stars = res.stars
      if(res.page_count) {this.totalPages = res.page_count;}
      if(res.cached) {this.cachedPages = res.cached;}
      if(this.cachedPages && this.cachedPages === this.totalPages) {
        this.trigger("stars_fetched", this.stars);
        return false;
      }
      else {
        if(this.cachedPages){
          currentPage += 1;
        }
        else {
          currentPage++;
        }
      }
      if(currentPage <= this.totalPages) {
        this.trigger("stars_fetched", this.stars);
        this.getGithubStars(currentPage);
      }
      else {
        this.trigger("stars_fetched", this.stars);
      }
    });
  }

  this.getRepoReadme = (repo) => {
    request.get(`/api/github/repo/${repo.owner.login}/${repo.name}/readme`).end( (err, res) => {
      let readme = JSON.parse(res.text).readme;
      this.trigger("readme_fetched", readme);
    });
  }

}

export default GithubStore;
