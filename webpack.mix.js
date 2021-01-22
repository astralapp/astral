let mix = require('laravel-mix')
let tailwindcss = require('tailwindcss')
let fs = require('fs')
let webpack = require('webpack')
let purgeCss = require('laravel-mix-purgecss')

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.webpackConfig({
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'resources/assets/js/')
    }
  }
})

mix
  .js('resources/assets/js/app.js', 'public/js')
  .sass('resources/assets/sass/app.scss', 'public/css/app.css')
  .options({
    extractVueStyles: true,
    processCssUrls: false,
    postCss: [tailwindcss('tailwind.config.js')]
  })
  .purgeCss({
    extensions: ['html', 'js', 'php', 'vue', 'scss', 'css'],
    globs: [
      path.join(__dirname, 'node_modules/easymde/dist/easymde.min.css'),
      path.join(__dirname, 'node_modules/easymde/dist/easymde.min.js'),
      path.join(__dirname, 'node_modules/vue2-datepicker/index.css')
    ]
  })

if (mix.inProduction()) {
  mix.version()
}
