const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const browserify = require('browserify');
const watchify = require('watchify');
const browserSync = require('browser-sync');

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

gulp.task('clean', function(cb) {
  plugins.cache.clearAll();
  cb(del.sync(['dist/styles', 'dist/scripts', 'dist/images']));
});

// Default task
gulp.task('default', ['clean', 'build']);
