var gulp = require("gulp");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var notify = require("gulp-notify");
var Server = require("karma").Server;
var bourbon = require("node-bourbon");
var elixir = require("laravel-elixir");

elixir.config.js.browserify.transformers.push({
    name: "vueify",
});

gulp.task("js", function(){
  elixir(function(mix) {
      mix.browserify("./resources/assets/js/app.js", "./public/js/app.bundle.js");
  });
});

gulp.task("sass", function(){
  gulp.src("resources/assets/sass/app.scss")
    .pipe(sass({
      includePaths: require("node-bourbon").includePaths,
      quiet: true
    }).on("error", notify.onError(function (error) {
        return "Build Failed: " + error.message;
    })))
    .pipe(autoprefixer({
      browsers: ["last 2 versions"]
    }))
    .pipe(gulp.dest("./public/css"));
});


gulp.task("watch", function(){
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
