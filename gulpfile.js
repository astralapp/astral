var gulp = require("gulp");
var notify = require("gulp-notify");
var Server = require("karma").Server;
var bourbon = require("node-bourbon");
var elixir = require("laravel-elixir");
var gutils = require('gulp-util');

require("laravel-elixir-browserify-official");
require("laravel-elixir-vueify");

var b = elixir.config.js.browserify;

if (gutils.env._.indexOf("watch") > -1) {
    b.plugins.push({
        name: "browserify-hmr",
        options : {}
    });
}


elixir(function(mix) {
    mix
    .browserify("app.js", "./public/js/app.bundle.js")
    .sass("app.scss", null, null, { includePaths: bourbon.includePaths, quiet: true})
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
