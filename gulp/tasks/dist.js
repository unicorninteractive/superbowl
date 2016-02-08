var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var RevAll = require('gulp-rev-all');
var p = require('../../package.json');
var execSync = require('child_process').execSync;

gulp.task('clean', ['build'], function() {
    return execSync('rm -rf ./dist/');
});

gulp.task('copy', ['clean'], function() {
    var revAll = new RevAll({
        dontRenameFile: ['.html',  /og-img/, /^\/favicon.ico$/g, /^\/boot.js/g],
        prefix: global.previewUrl || p.previewUrl
    });

    return gulp.src('./build/**')
            .pipe(revAll.revision())
            .pipe(gulp.dest('dist'));
});

gulp.task('dist', ['copy'], function() {
    gulp.src('./dist/*.css')
        .pipe(minifycss())
        .pipe(gulp.dest('dist'));

    return gulp.src('./dist/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});