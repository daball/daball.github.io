var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var del = require('del');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream')
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();
var pug = require('gulp-pug');
var _pug = require('pug');
var slugify = require('slug');
var extend = require('extend');
var runSequence = require('run-sequence');
// var Git = require('nodegit');
var git = require('gulp-git');


// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      basedir: basedir
    }
  });
});




// Dev task
gulp.task('dev', ['html', 'assets', 'css', 'js', 'pdf', 'vendor', 'github', 'browserSync'], function() {
  gulp.watch('./scss/*.scss', ['css']);
  gulp.watch('./js/*.js', ['js']);
  gulp.watch('./assets/*', ['assets']);
  gulp.watch('./**/*.pug', ['html', browserSync.reload]);
});
