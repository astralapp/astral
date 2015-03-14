var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var sass = require('gulp-ruby-sass');
var phpunit = require('gulp-phpunit');

var paths = {
  ngServices: 'resources/assets/coffee/services/**/*.coffee',
  ngControllers: 'resources/assets/coffee/controllers/**/*.coffee',
  ngDirectives: 'resources/assets/coffee/directives/**/*.coffee',
  ngApp: 'resources/assets/coffee/app.coffee',
  appStyles: 'resources/assets/sass/app.scss',
};

var bowerComponents = [
'public/bower_components/jquery/dist/jquery.min.js',
'public/bower_components/jquery-ui/ui/minified/core.min.js',
'public/bower_components/jquery-ui/ui/minified/widget.min.js',
'public/bower_components/jquery-ui/ui/minified/mouse.min.js',
'public/bower_components/jquery-ui/ui/minified/sortable.min.js',
'public/bower_components/lodash/dist/lodash.min.js',
'public/bower_components/velocity/jquery.velocity.min.js',
'public/bower_components/spin.js/spin.js',
'public/bower_components/google-code-prettify/src/prettify.js',
'public/bower_components/moment/min/moment.min.js',
'public/bower_components/chosen_v1.1.0/chosen.jquery.min.js',
'public/bower_components/angular/angular.min.js',
'public/bower_components/angular-classy/angular-classy.min.js',
'public/bower_components/angular-route/angular-route.min.js',
'public/bower_components/angular-sanitize/angular-sanitize.min.js',
'public/bower_components/angular-animate/angular-animate.min.js',
'public/bower_components/angular-chosen-localytics/chosen.js',
'public/bower_components/ng-tags-input/build/ng-tags-input.js',
'public/bower_components/angular-ui-sortable/sortable.min.js',
];

gulp.task('js', function(){
  //Angular Controllers
  gulp.src([paths.ngApp, paths.ngServices, paths.ngControllers, paths.ngDirectives])
    .pipe(coffee({bare: true}))
    .on('error', notify.onError(function (error) {
        return "Build Failed: " + error.message;
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('public/js/'))
});
gulp.task('sass', function(){
  gulp.src(paths.appStyles)
    .pipe(sass({
      loadPath: require('node-bourbon').includePaths,
      style: 'nested',
      quiet: true
    }))
    .on('error', notify.onError(function (error) {
        return "Build Failed: " + error.message;
    }))
    .pipe(gulp.dest('public/css/'))
});

gulp.task('phpunit', function() {
  var options = {debug: false, notify: true};
  gulp.src('app/tests/*.php')
    .pipe(phpunit('', options))
    .on('error', notify.onError({
      title: 'PHPUnit Failed',
      message: 'One or more tests failed, see the cli for details.'
    }))
    .pipe(notify({
      title: 'PHPUnit Passed',
      message: 'All tests passed!'
    }));
});
gulp.task('concatBowerComponents', function(){
  gulp.src(bowerComponents, {base: 'public/bower_components'})
    .pipe(concat('components.js'))
    .pipe(gulp.dest('public/js/'));
});
gulp.task('watch', function(){
  gulp.watch(['app/assets/coffee/**/*.coffee'], ['js']);
  gulp.watch(['app/assets/sass/**/*.scss'], ['sass']);
  // gulp.watch('app/**/*.php', ['phpunit']);
});
gulp.task('default', [
  'js',
  'sass',
  // 'phpunit',
  'watch'
]);
gulp.task('production-build', ['concatBowerComponents']);