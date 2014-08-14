var env = process.env.NODE_ENV || 'development';

var gulp        = require('gulp');
var gutil       = require('gulp-util');
var concat      = require('gulp-concat');
var gulpif      = require('gulp-if');
var less        = require('gulp-less');
var minifyCSS   = require('gulp-minify-css');
var ngAnnotate  = require('gulp-ng-annotate');
var ngConstant  = require('gulp-ng-constant');
var ngTemplates = require('gulp-ng-html2js');
var nodemon     = require('gulp-nodemon');
var prefix      = require('gulp-autoprefixer');
var replace     = require('gulp-replace');
var uglify      = require('gulp-uglify');
var karma       = require('gulp-karma');
var _           = require('lodash');
var path        = require('path');

var manifest = {
  css: [
    'css/index.less',
  ],
  javascripts: [
    'vendor/angular/angular.js',
    'vendor/angular-resource/angular-resource.js',
    'vendor/copycopter/lib/copycopter.js',
    'vendor/enhance/build/enhance.js',
    'app/**/*.js',
    'public/config.js',
    'public/module.js',
    'public/template.js'
  ]
};


gulp.task('css', function() {
  return gulp.src(manifest.css)
    .pipe(gulpif(/\.less$/, less({
      paths: [
        path.join(__dirname, 'css')
      ]
    })))
    .pipe(replace(/images/g, '<%= fullAppName %>/images/vendor'))
    .pipe(prefix('last 3 versions', 'ie 9'))
    .pipe(concat('application.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('public'));
});

gulp.task('constants', function() {
  var constants = require('./config/constants.js')[env];

  return gulp.src('app/config.json')
    .pipe(ngConstant({
      constants: {
        config: constants
      }
    }))
    .pipe(concat('config.js'))
    .pipe(gulp.dest('public'));
});

gulp.task('templates', function() {
  return gulp.src("app/views/**/*.html")
    .pipe(ngTemplates({
      moduleName: '<%= fullAppName %>',
      rename: function(url) {
        return url.replace(".html", "");
      }
    }))
    .pipe(concat('template.js'))
    .pipe(gulp.dest('public'));
});

gulp.task('specs', ['js'], function() {
  var javascripts = ["public/jquery.min.js",
                     "public/assets.shared.js",
                     "public/application.js",
                     "spec/**/*_spec.js"];

  return gulp.src(javascripts)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      throw err;
    });
});

gulp.task('js', ['constants', 'templates'], function() {
  var javascripts = manifest.javascripts;
  if (env === 'test') {
    javascripts = _.without(javascripts, 'vendor/js-base64/base64.js');
  }

  return gulp.src(manifest.javascripts)
    .pipe(ngAnnotate())
    .pipe(concat('application.js'))
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest('public'));
});

gulp.task('watch', ['css', 'js'], function() {
  gulp.watch('css/**/*', ['css']);
  gulp.watch('app/**/*', ['js']);
  if (env !== 'test') {
    nodemon({
      script: 'server.js',
      ext:    'html js css',
      watch: ['server.js', 'spec/factories/*'],
      env: {
        NODE_ENV: env,
      }
    }).on('restart', function() {
      gutil.log(gutil.colors.yellow('Server restarted!'));
    });
  }
});

gulp.task('default', ['css', 'js']);
