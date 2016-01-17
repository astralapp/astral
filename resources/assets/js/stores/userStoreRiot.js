import riot from "riot";
import request from "superagent";
import ls from "local-storage";

function UserStore() {

  this.user = {};

  this.on("user_updated", (user) => {
    this.user = user;
  });

  this.on("fetch_user", () => {
    this.fetchUser();
  });

  this.on("user_signed_out", () => {
    request.get("/api/auth/logout").end( (err, res) => {
      this.user = {};
      ls.remove("user");
    });
  });

  this.fetchUser = () => {
    request.get("/api/auth/user").end( (err, res) => {
      this.user = JSON.parse(res.text);
      ls("user", this.user);
      this.trigger("user_fetched", this.user);
    });
  }
}

export default UserStore;
