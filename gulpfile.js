var gulp = require('gulp');
var babel = require('gulp-babel');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var rename = require('gulp-rename');

gulp.task('babelify', function () {
    return gulp.src('./index.jsx')
        .pipe(babel({
            plugins: ['transform-react-jsx'],
            presets: ['babel-preset-react','env']
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('bundle', ['babelify'], function () {
    var b = browserify({
        entries: './build/index.js',
        debug: false
    });

    b.on('file', gutil.log);
    return b.bundle()
        .pipe(source('./build/index.js'))
        .on('error', gutil.log)
        .pipe(rename('build.js'))
        .pipe(gulp.dest('./build'));
});
gulp.start('bundle');
