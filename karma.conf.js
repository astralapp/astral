module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'dist/main.bundle.js',
      'assets/js/spec/**/*.spec.js'
    ],
    browsers: ['PhantomJS'],
    reporters: ['spec']
  });
}
