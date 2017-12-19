const gulp = require('gulp'),
  changed = require('gulp-changed'),//检查改变状态
  del = require('del'),
  browserSync = require("browser-sync").create(),//浏览器实时刷新
  sass = require('gulp-sass'),
  replace = require('gulp-replace'),
  babel = require('gulp-babel'),
  print = require('gulp-print'),
  cssMin = require('gulp-css'),
  image = require('gulp-image'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify')

gulp.task('delete', function (cb) {
  return del(['dist/*', 'example/*.build.js'], cb);
})

gulp.task('js', function () {
  return gulp.src(['src/QTree.js'])
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./dist'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist'))
});

gulp.task('css', function () {
  gulp.src('./src/QTree.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist'))
    .pipe(cssMin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist'))
})


gulp.task('sass', () => {
  gulp.src(['./example/styles/*.scss','./src/QTree.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./example/styles/'))
    .pipe(cssMin())
    .pipe(rename({suffix: '.build'}))
    .pipe(browserSync.reload({stream: true}));
});


gulp.task('babel', () => {
  return gulp.src(['./example/scripts/*.js','./src/QTree.js','!./example/scripts/*.build.js'])
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(rename({suffix: '.build'}))
    .pipe(gulp.dest('./example/scripts/'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('serve',['delete'], function () {
  gulp.start('babel', 'sass','js','css');
  browserSync.init({
    port: 2018,
    server: {
      baseDir: ['example']
    }
  });
  gulp.watch('./src/QTree.js', ['babel','js']);
  gulp.watch('./src/QTree.scss', ['sass','css']);

  gulp.watch(['./example/scripts/*.js','!./example/scripts/*.build.js'], ['babel']);         //监控文件变化，自动更新
  gulp.watch('./example/**/*.scss', ['sass']);
});


gulp.task('build', ['js', 'css'])
gulp.task('default', ['serve']);
// gulp.task('build', ['babel', 'sass', 'html', 'cssMinfy', 'image']);
