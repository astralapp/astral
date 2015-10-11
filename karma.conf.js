module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'public/js/app.bundle.js',
      'tests/js/**/*.spec.js'
    ],
    browsers: ['PhantomJS'],
    reporters: ['spec']
  });
}
