//'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var rename = require('gulp-rename');
var babel  = require('gulp-babel');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('js', function() {
  return gulp.src(['js-gulp/*.js'])
  .pipe(concat('./js-gulp/main.js'))
  .pipe(babel({
    "presets": ["es2015"]
  }))
  .pipe(uglify())
  .pipe(rename('public.min.js'))
  .pipe(gulp.dest('./dist/'));
});

gulp.task('css', function () {
  return gulp.src(['css/*.css'])
  .pipe(concat('./css/main.css'))
  .pipe(autoprefixer())
  .pipe(rename('public.min.css'))
  // .pipe(htmlmin({
  //   collapseWhitespace: true,
  //   minifyCSS: true
  // }))
  .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function() {
  gulp.watch(['js-gulp/*.js'], ['js']);
  gulp.watch(['css/*.css'], ['css']);
});

gulp.task('build', ['js', 'css']);