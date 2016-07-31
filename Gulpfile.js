var spawn = require('child_process').spawn;
var gulp  = require('gulp');

gulp.task('npm', function (done) {
  spawn('npm', ['publish'], { stdio: 'inherit' }).on('close', done);
});
