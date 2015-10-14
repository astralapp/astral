var gulp = require("gulp");
var browserify = require("browserify");
var babelify = require("babelify");
var riotify = require("riotify");
var source = require("vinyl-source-stream");
var Server = require("karma").Server;
var bourbon = require("node-bourbon");
var notify = require("gulp-notify");
var sass = require("gulp-sass");

gulp.task("js", function () {
  return browserify({debug: false, entries: ["resources/assets/js/app.js"]})
  .transform(babelify.configure({
    extensions: [".js"]
  }))
  .transform(riotify, {type:"es6"})
  .bundle().on("error", function(err){
    console.log(err.message);
    this.emit("end");
  })
  .pipe(source("app.bundle.js"))
  .pipe(gulp.dest("public/js/"));
});

gulp.task("sass", function(){
    gulp.src("resources/assets/sass/app.scss")
      .pipe(sass({
        includePaths: require("node-bourbon").includePaths,
        quiet: true
      }).on("error", notify.onError(function (error) {
          return "Build Failed: " + error.message;
      })))
      .pipe(gulp.dest("public/css/"))
});

gulp.task("watch", function(){
  gulp.watch(["resources/assets/js/**/*.coffee", "resources/assets/js/**/*.tag"], ["js"]);
  gulp.watch(["resources/assets/sass/**/*.scss"], ["sass"]);
});

gulp.task("test", ["js"], function (done) {
  return new Server({
    configFile: __dirname + "/karma.conf.js",
    singleRun: true
  }, done).start();
});

gulp.task("tdd", ["js"], function (done) {
  new Server({
    configFile: __dirname + "/karma.conf.js",
  }, done).start();
});
gulp.task("default", [
  "js",
  "sass",
  // "tdd",
  "watch"
]);
