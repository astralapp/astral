var gulp = require("gulp");
var sass = require("gulp-sass");
var notify = require("gulp-notify");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var browserify = require("browserify");
var watchify = require("watchify");
var babelify = require("babelify");
var vueify = require("vueify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var Server = require("karma").Server;
var bourbon = require("node-bourbon");
var assign = require("lodash/assign");

vueify.compiler.applyConfig({
  sass: {
    includePaths: bourbon.includePaths,
  }
});

var browserifyArgs = {
  debug: true,
  entries: "./resources/assets/js/app.js",
  transform: [
    ["babelify", {
      extensions: [".js"]
    }],
    "vueify"
  ],
  plugin: [
    ["vueify-extract-css", {
      out: "./resources/assets/sass/_components.scss"
    }]
  ]
}

var watchifyArgs = assign(watchify.args, browserifyArgs);
var bundler = watchify(browserify(watchifyArgs));

function scripts(){
  console.log("Bundling started...");
  console.time("Bundling finished");
  return bundler
    .bundle()
    .on("end", function(){ console.timeEnd("Bundling finished") })
    .pipe(source("app.bundle.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write("../maps"))
    .pipe(gulp.dest("./public/js"));
}

bundler.on("update", scripts);
gulp.task("js", scripts);

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
