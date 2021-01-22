let mix = require('laravel-mix')
let tailwindcss = require('tailwindcss')
let path = require('path')
require('webpack')
require('laravel-mix-purgecss')

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
  .vue()
  .sass('resources/assets/sass/app.scss', 'public/css/app.css')
  .options({
    processCssUrls: false,
    postCss: [tailwindcss('tailwind.config.js')]
  })
  .purgeCss({
    extend: {
      safelist: {
        deep: [
          /^mx-/,
          /^CodeMirror(-\w*)?/,
          /^cm-\w*/,
          /^EasyMDEContainer/,
          /^editor-toolbar/,
          /^easymde-\w*/,
          /^collection-(cluster|space)$/
        ]
      }
    }
  })

if (mix.inProduction()) {
  mix.version()
}
