var spawn = require('child_process').spawn;
var gulp  = require('gulp');
var bump = require('gulp-bump');

gulp.task('npm', function (done) {
  spawn('npm', ['publish'], { stdio: 'inherit' }).on('close', done);
});

gulp.task('bump', function(){
  gulp.src('./package.json')
  .pipe(bump({type:'minor'}))
  .pipe(gulp.dest('./'));
});
