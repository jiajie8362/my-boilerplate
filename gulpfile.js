const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserify = require('browserify');
const watchify = require('watchify');
const browserSync = require('browser-sync');
const source = require('vinyl-source-stream');
const sourceFile = './client/scripts/app.js';
const destFolder = './dist/scripts';
const destFileName = 'app.js';
const reload = browserSync.reload;
const del = require('del');
const nodemon = require('gulp-nodemon');

const bundler = watchify(browserify({
  entries: [sourceFile],
  debug: true,
  insertGlobals: true,
  cache: {},
  packageCache: {},
  fullPaths: true
}));

function rebundle() {
  return bundler.bundle()
    // log errors if they happen
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(source(destFileName))
    .pipe(gulp.dest(destFolder))
    .on('end', function() {
      reload();
    });
}


bundler.on('update', rebundle);
bundler.on('log', $.util.log);

// HTML
gulp.task('html', function() {
  return gulp.src('client/*.html')
      .pipe($.useref())
      .pipe(gulp.dest('dist'))
      .pipe($.size());
});

// Images
gulp.task('images', function() {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size());
});

gulp.task('stylus', function() {
  return gulp.src(['client/styles/**/*.styl'])
      .pipe($.stylus())
      .pipe($.autoprefixer('last 1 version'))
      .pipe(gulp.dest('dist/styles'))
      .pipe($.size());
});

gulp.task('scripts', rebundle);

gulp.task('buildScripts', function() {
  return browserify(sourceFile)
      .bundle()
      .pipe(source(destFileName))
      .pipe(gulp.dest('dist/scripts'));
});
// Build
gulp.task('build', ['html', 'buildBundle', 'images'], function() {
  gulp.src('dist/scripts/app.js')
      .pipe($.uglify())
      .pipe($.stripDebug())
      .pipe(gulp.dest('dist/scripts'));
});

// Watch
gulp.task('watch', ['html', 'bundle'], function() {
  browserSync({
    notify: false,
    logPrefix: 'BS',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    // will present a certificate warning in the browser.
    // https: true,
    server: ['dist', 'app']
  });
  // Watch .html files
  gulp.watch('client/*.html', ['html']);
});

gulp.task('clean', function(cb) {
  $.cache.clearAll();
  del.sync(['dist/*']);
  cb();
});

// Bundle
gulp.task('bundle', ['scripts', 'bower'], function() {
  return gulp.src('./client/*.html')
      .pipe($.useref.assets())
      .pipe($.useref.restore())
      .pipe($.useref())
      .pipe(gulp.dest('dist'));
});

gulp.task('buildBundle', ['buildScripts', 'bower'], function() {
  return gulp.src('./client/*.html')
      .pipe($.useref.assets())
      .pipe($.useref.restore())
      .pipe($.useref())
      .pipe(gulp.dest('dist'));
});

// Bower helper
gulp.task('bower', function() {
  gulp.src('app/bower_components/**/*.js', {
    base: 'app/bower_components'
  })
  .pipe(gulp.dest('dist/bower_components/'));
});

gulp.task('start', ['watch'], function() {
  apiConfig = {
    verbose: false,
    restartable: 'rs',
    ext: 'js,coffee,es',
    script: 'server/app',
    ignore: ['client', 'node_modules/', 'gulpfile.*'],
    env: {
      env: process.env.NODE_ENV || 'development',
      DEBUG: process.env.DEBUG || 'api*'
    }
  };

  nodemon(apiConfig);
});

gulp.task('nodemon', function(cb) {
  var called = false;
  return nodemon({
    // nodemon our expressjs server
    script: 'server/app.js',

    // watch core server file(s) that require server restart on change
    watch: ['server/app.js']
  })
  .on('start', function onStart() {
      // ensure start only got called once
    if (!called) { cb(); }
    called = true;
  })
  .on('restart', function onRestart() {
    // reload connected browsers after a slight delay
    setTimeout(function() {
      browserSync.reload({
        stream: false //
      });
    }, 500);
  });
});

gulp.task('b', ['nodemon'], function() {
  // for more browser-sync config options: http://www.browsersync.io/docs/options/
  browserSync.init({

    // watch the following files; changes will be injected (css & images) or cause browser to refresh
    files: ['public/**/*.*'],

    // informs browser-sync to proxy our expressjs app which would run at the following location
    proxy: 'http://localhost:3000',

    // informs browser-sync to use the following port for the proxied app
    // notice that the default port is 3000, which would clash with our expressjs
    port: 4000,

    // open the proxied app in chrome
    browser: ['google-chrome']
  });
});

// Default task
gulp.task('default', ['clean', 'build']);
