const metalsmith = require('metalsmith');
const msIf = require('metalsmith-if');
const browserSync = require('metalsmith-browser-sync');
const inplace = require('metalsmith-in-place');
const htmlMinifier = require("metalsmith-html-minifier");
const layouts = require('metalsmith-layouts');
const markdown = require('metalsmith-markdown');
const metadata = require('metalsmith-metadata');
const permalinks = require('metalsmith-permalinks');
const postcss = require('metalsmith-postcss');
const sass = require('metalsmith-sass');

const handlebars = require('handlebars');
const helpers = require('./handlebars-helpers');

const shouldServe = process.env.SERVE === 'true';
const watch = process.env.WATCH === 'true';

let browserSyncOpts = {
  port: 8001,
  server: {
    baseDir: 'build'
  }
};

let minifierOpts = {
  minifierOptions: {
    removeComments: false,
    collapseWhitespace: true
  },
  pattern: "**/*.html",
}

if (watch) {
  browserSyncOpts.files = ['src/**/*', 'layouts/**/*', 'partials/**/*']
}

// Register helpers
// See ./handlebars-helpers.js for docs
handlebars.registerHelper(helpers);

metalsmith(__dirname)
  .source('../src')
  .destination('../build')
  .metadata({
    site: {
      url: ''
    }
  })
  .use(sass({
    'outputStyle': 'compressed',
    'sourceComments': false,
    'outputDir': 'css/'
  }))
  .use(
    postcss({
      plugins: {
        'postcss-import': {},
        'postcss-nesting': {},
        'autoprefixer': {}
      }
    })
  )
  .ignore('**/modules/*.css')
  .use(
    inplace({
      engine: 'handlebars',
      pattern: ['**/*.html'],
      partials: '../partials'
    })
  )
  .use(
    inplace({
      engine: 'handlebars',
      pattern: ['**/*.css'],
      partials: '../src/css'
    })
  )
  .use(markdown())
  .use(
    layouts({
      engine: 'handlebars',
      default: 'default.html',
      pattern: ['**/*.html'],
      directory: '../layouts',
      partials: '../partials'
    })
  )
  .use(
    permalinks({
      relative: false
    })
  )
  .ignore('**/first-paint.css')
  .use(htmlMinifier(minifierOpts))
  .use(
    msIf(
      shouldServe,
      browserSync(browserSyncOpts)
    )
  )
  .build(err => {
    if (err) {
      throw err;
    }
    else {
      console.log('built!');
    }
  })
