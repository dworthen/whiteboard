var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  concat = require('gulp-concat'),
  stripDebug = require('gulp-strip-debug'),
  uglify = require('gulp-uglify'),
  browserSync = require('browser-sync'),
  sass = require('gulp-sass'),
  nodemon = require('gulp-nodemon');

var BROWSER_SYNC_RELOAD_DELAY = 500;

gulp.task('browser-sync', ['watch'], function() {
  browserSync.init({

    // watch the following files; changes will be injected (css & images) or cause browser to refresh
    files: ['public/**/*.*'],

    // informs browser-sync to proxy our expressjs app which would run at the following location
    proxy: 'http://localhost:3000',

    // informs browser-sync to use the following port for the proxied app
    // notice that the default port is 3000, which would clash with our expressjs
    port: 4000,

    // open the proxied app in chrome
    browser: ['google chrome']
  });
});

gulp.task('jshint', function() {
  gulp.src(__dirname + '/src/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('sass', function() {
  gulp.src('./src/scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('scripts', function() {
  var src = __dirname + '/src/js/';
  return gulp.src([src + '*.js'])
    .pipe(concat('script.js'))
    // .pipe(stripDebug())
    // .pipe(uglify())
    .pipe(gulp.dest(__dirname + '/public/javascripts/'));
});

gulp.task('nodemon', function() {
  nodemon({
    script: 'app.js',
    ext: 'js jade',
    ignore: ['./src/**']
  })
    .on('change', ['scripts'])
    .on('restart', function() {
      console.log('restarted!');
      setTimeout(function reload() {
        browserSync.reload({
          stream: false //
        });
      }, BROWSER_SYNC_RELOAD_DELAY);
    });
});

gulp.task('compile', ['scripts', 'sass']);

gulp.task('watch', ['nodemon'], function() {
  gulp.watch('./src/scss/*.scss', ['sass']);
});

gulp.task('default', ['compile', 'browser-sync']);
