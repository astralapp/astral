var gulp = require("gulp");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var notify = require("gulp-notify");
var Server = require("karma").Server;
var bourbon = require("node-bourbon");
var elixir = require("laravel-elixir");
var vueify = require('laravel-elixir-vueify');

elixir(function(mix) {
    mix
    .browserify("app.js", "./public/js/app.bundle.js")
    .sass("app.scss", null, { includePaths: require("node-bourbon").includePaths, quiet: true})
    .version(["js/app.bundle.js", "css/app.css"]);
});

gulp.task("test", function (done) {
  return new Server({
    configFile: __dirname + "/karma.conf.js",
    singleRun: true
  }, done).start();
});

gulp.task("tdd", function (done) {
  return new Server({
    configFile: __dirname + "/karma.conf.js",
  }, done).start();
});
