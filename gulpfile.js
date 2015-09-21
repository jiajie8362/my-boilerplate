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

gulp.task('scripts', rebundle);

// Build
gulp.task('build', ['html'], function() {
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
  gulp.watch('app/*.html', ['html']);
});

gulp.task('clean', function(cb) {
  //$.cache.clearAll();
  //cb(del.sync(['dist/styles', 'dist/scripts', 'dist/images']));
});

// Default task
gulp.task('default', ['clean', 'build']);
