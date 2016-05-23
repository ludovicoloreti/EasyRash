var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var ngAnnotate = require('gulp-ng-annotate');
var sh = require('shelljs');
var bowerFiles = require('main-bower-files');
var gulpNgConfig = require('gulp-ng-config');
var runSequence = require('run-sequence');

var paths = {
  javascript: ['client/js/*.js'],
  config: ['config/client/api_config.json']
};

// gulp.task('default', ['config', 'javascript']);
gulp.task('default', function() {
	runSequence(
		'config',
		'javascript'
	);
});

gulp.task('config', function () {
  gulp.src(paths.config)
  .pipe(gulpNgConfig('EasyRashApp.config'))
  .pipe(gulp.dest('client/js'))
});

gulp.task('javascript', function(done) {
  gulp.src(paths.javascript)
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('client/lib'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.javascript, ['javascript']);
  gulp.watch(paths.config, ['config']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
