let mix = require('laravel-mix')
let tailwindcss = require('tailwindcss')
let fs = require('fs')
let webpack = require('webpack')
let glob = require('glob-all')
let PurgecssPlugin = require('purgecss-webpack-plugin')

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

class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:\/]+/g)
  }
}

let plugins = []

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new PurgecssPlugin({
      paths: glob.sync([
        path.join(__dirname, 'resources/assets/js/**/*.vue'),
        path.join(__dirname, 'resources/views/**/*.blade.php')
      ]),
      extractors: [
        {
          extractor: TailwindExtractor,
          extensions: ['html', 'js', 'php', 'vue']
        }
      ]
    })
  )
}

mix.webpackConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/assets/js')
    }
  },
  plugins: plugins
})

mix
  .js('resources/assets/js/app.js', 'public/js')
  .sass('resources/assets/sass/app.scss', './../resources/assets/sass/temp')
  .sass(
    'resources/assets/sass/preflight.scss',
    './../resources/assets/sass/temp'
  )
  .combine(
    [
      'resources/assets/sass/temp/preflight.css',
      'resources/assets/sass/temp/app.css'
    ],
    'public/css/app.css'
  )
  .options({
    extractVueStyles: true,
    postCss: [tailwindcss('tailwind.js')]
  })
  .then(function() {
    fs.unlinkSync('resources/assets/sass/temp/preflight.css')
    fs.unlinkSync('resources/assets/sass/temp/app.css')
  })
