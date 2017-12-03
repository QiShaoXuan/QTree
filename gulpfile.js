const gulp = require('gulp'),
    htmlMin = require('gulp-htmlmin'),//压缩html
    changed = require('gulp-changed'),//检查改变状态
    del = require('del'),
    browserSync = require("browser-sync").create(),//浏览器实时刷新
    sass = require('gulp-sass'),
    replace = require('gulp-replace'),
    babel = require('gulp-babel'),
    print = require('gulp-print'),
    cssMin = require('gulp-css'),
    image = require('gulp-image')

//删除dist下的所有文件
gulp.task('delete', function (cb) {
    return del(['dist/*', '!dist/images', '!dist/fonts'], cb);
})

//压缩html
gulp.task('html', function () {
    var options = {
        removeComments: false,//清除HTML注释
        collapseWhitespace: false,//压缩HTML
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: false,//压缩页面JS
        minifyCSS: false//压缩页面CSS
    };
    gulp.src('src/*.html')
        .pipe(changed('dist', {hasChanged: changed.compareSha1Digest}))
        .pipe(htmlMin(options))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('cssMinfy', function () {
    gulp.src('src/**/*.css')
        .pipe(cssMin())
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('sass', () => {
    gulp.src('src/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('image', function () {
    gulp.src(['src/**/*.png', 'src/**/*.jpg', 'src/**/*.svg'])
        .pipe(image())
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('babel', () => {
    return gulp.src(['src/**/*.js'])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({stream: true}));
});

//启动热更新
gulp.task('serve', ['delete'], function () {
    gulp.start('babel', 'sass', 'html', 'cssMinfy', 'image');
    browserSync.init({
        port: 2017,
        server: {
            baseDir: ['dist']
        }
    });
    gulp.watch(['src/**/*.png', 'src/**/*.jpg', 'src/**/*.svg'], ['image'])
    gulp.watch('src/**/*.js', ['babel']);         //监控文件变化，自动更新
    gulp.watch('src/**/*.css', ['cssMinfy']);
    gulp.watch('src/**/*.scss', ['sass']);
    gulp.watch('src/*.html', ['html']);
});

gulp.task('default', ['serve']);
gulp.task('build', ['babel', 'sass', 'html', 'cssMinfy', 'image']);
