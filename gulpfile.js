var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var sass = require('gulp-ruby-sass');
var bourbon = require('node-bourbon');

var paths = {
  ngServices: 'resources/assets/coffee/services/**/*.coffee',
  ngControllers: 'resources/assets/coffee/controllers/**/*.coffee',
  ngDirectives: 'resources/assets/coffee/directives/**/*.coffee',
  ngApp: 'resources/assets/coffee/app.coffee',
  appStyles: 'resources/assets/sass/app.scss',
};

gulp.task('js', function(){
  //Angular Controllers
  gulp.src([paths.ngApp, paths.ngServices, paths.ngControllers, paths.ngDirectives])
    .pipe(coffee({bare: true}))
    .on('error', notify.onError(function (error) {
        return "Build Failed: " + error.stack;
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('public/js/'))
});

gulp.task('sass', function(){
    sass(paths.appStyles, {
      loadPath: bourbon.includePaths,
      style: 'nested',
      quiet: true
    })
    .on('error', notify.onError(function (error) {
        return "Build Failed: " + error.message;
    }))
    .pipe(gulp.dest('public/css/'))
});

gulp.task('watch', function(){
  gulp.watch(['resources/assets/coffee/**/*.coffee'], ['js']);
  gulp.watch(['resources/assets/sass/**/*.scss'], ['sass']);
});
gulp.task('default', [
  'js',
  'sass',
  'watch'
]);
