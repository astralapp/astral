var gulp = require("gulp");
var browserify = require("browserify");
var babelify = require("babelify");
var vueify = require("vueify");
var source = require("vinyl-source-stream");
var Server = require("karma").Server;
var bourbon = require("node-bourbon");
var sass = require("gulp-sass");
var notify = require("gulp-notify");

gulp.task("js", function () {
  return browserify({debug: false, entries: ["resources/assets/js/app.js"]})
  .transform(babelify.configure({
    extensions: [".js"]
  }))
  .transform(vueify)
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
  gulp.watch(["resources/assets/js/**/*.js", "resources/assets/js/**/*.vue"], ["js"]);
  gulp.watch(["resources/assets/sass/**/*.scss"], ["sass"]);
});

gulp.task("test", function (done) {
  return new Server({
    configFile: __dirname + "/karma.conf.js",
    singleRun: true
  }, done).start();
});

gulp.task("tdd", function (done) {
  new Server({
    configFile: __dirname + "/karma.conf.js",
  }, done).start();
});
gulp.task("default", [
  "js",
  "sass",
  "watch"
]);
