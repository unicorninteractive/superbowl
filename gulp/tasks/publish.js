var gulp = require('gulp');
var execSync = require('child_process').execSync;
var p = require('../../package.json');

gulp.task('publish', ['dist'], function() {
    execSync('gsutil -m rsync -c -r -d ./dist/ ' + p.publishUrl);
});