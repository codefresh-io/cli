var spawn       = require('child_process').spawn;
var gulp        = require('gulp');
var bump        = require('gulp-bump');
var jshint      = require('gulp-jshint');
var rimraf      = require('gulp-rimraf');

gulp.task('publish', function (done) {
  spawn('npm', ['publish'], { stdio: 'inherit' }).on('close', done);
});

gulp.task('bump', function(){
  gulp.src('./package.json')
  .pipe(bump({type:'minor'}))
  .pipe(gulp.dest('./'));
});

gulp.task('clean', function () {
  return gulp.src(['.coverdata', '.debug', '.coverrun'], {read: false})
      .pipe(rimraf());
});

gulp.task('lint', ['clean'], function () {
  return gulp.src(['**/*.js', '!**/node_modules/**', '!**/server/migration/**', '!coverage/**/*.js'])
      .pipe(jshint({lookup: true}))
      .pipe(jshint.reporter('default'))
      .pipe(jshint.reporter('fail'));
});