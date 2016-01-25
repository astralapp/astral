var gulp = require("gulp");
var browserify = require("browserify");
var babelify = require("babelify");
var vueify = require("vueify");
var watchify = require("watchify");
var source = require("vinyl-source-stream");
var Server = require("karma").Server;
var bourbon = require("node-bourbon");
var sass = require("gulp-sass");
var notify = require("gulp-notify");

function scripts(watch){
  var bundler, rebundle;
  bundler = browserify({
    basedir: __dirname,
    debug: false,
    entries: "./resources/assets/js/app.js",
    cache: {},
    packageCache: {},
    fullPaths: watch
  });
  if(watch){
    bundler = watchify(bundler, {
      poll: true,
      ignoreWatch: ["**/node_modules/**"]
    });
  }
  bundler.transform(babelify.configure({
    extensions: [".js"]
  }));
  bundler.transform(vueify);

  rebundle = function() {
    var stream = bundler.bundle();
    stream.on("error", function(err){
      console.log(err.message);
      this.emit("end");
    });
    stream.pipe(source("app.bundle.js")).pipe( gulp.dest("./public/js") );
  };
  bundler.on("log", function(data) {
    console.log("Script bundling succeeded: " + data);
});
  bundler.on("update", rebundle);
  return rebundle();
}
gulp.task("scripts", function () {
  return scripts(false);
});

gulp.task("sass", function(){
  gulp.src("resources/assets/sass/app.scss")
    .pipe(sass({
      includePaths: require("node-bourbon").includePaths,
      quiet: true
    }).on("error", notify.onError(function (error) {
        return "Build Failed: " + error.message;
    })))
    .pipe(gulp.dest("./public/css"));
});


gulp.task("watch", function(){
  scripts(true);
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
  "scripts",
  "sass",
  "watch"
]);
