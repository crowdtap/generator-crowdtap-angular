var gulp             = require('gulp');
var concat           = require('gulp-concat');
var jshint           = require('gulp-jshint');
var uglify           = require('gulp-uglify');
var less             = require('gulp-less');
var angularTemplates = require('gulp-ng-html2js');
var ngConstant       = require('gulp-ng-constant');
var nodemon          = require('gulp-nodemon');
var shell            = require('gulp-shell');
var wrapper          = require('gulp-wrapper');
var karma            = require('gulp-karma');

javascripts = [
  'vendor/angular/angular.js',
  'vendor/angular-resource/angular-resource.js',
  'vendor/copycopter/lib/copycopter.js',
  'vendor/enhance/build/enhance.js',
  'public/module.js',
  'public/config.js',
  'public/template.js'
]

gulp.on('err', function(err) {
  throw err;
});

gulp.task('uglify:test', ['wrap', 'ngConstants:test', 'ngTemplates'], function() {
  return gulp.src(javascripts)
    .pipe(concat('application.js'))
    .pipe(uglify({ mangle: false, output: { beautify: true } }))
    .pipe(gulp.dest('public'));
});

gulp.task('uglify:development', ['wrap', 'ngConstants:development', 'ngTemplates'], function() {
  return gulp.src(javascripts)
    .pipe(concat('application.js'))
    .pipe(uglify({ mangle: false, output: { beautify: true } }))
    .pipe(gulp.dest('public'));
});

gulp.task('uglify:production', ['wrap', 'ngConstants:production', 'ngTemplates'], function() {
  return gulp.src(javascripts)
    .pipe(concat('application.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public'));
});

gulp.task('less', function() {
  return gulp.src('css/index.less')
    .pipe(less({ paths: ['css'], compress: true }))
    .pipe(concat('application.css'))
    .pipe(gulp.dest('public'));
});

gulp.task('ngConstants:test', function() {
  return gulp.src('app/config.json')
    .pipe(ngConstant({
      constants: {
        config: {
            assetPrefixUrl: "",
            branch: "",
            hashAssets: false,
            copycopter: {
              apiKey: '01234',
            },
            loadMoreActions: 5,
            enhance: false
        }
      }
    }))
    .pipe(concat('config.js'))
    .pipe(gulp.dest('public'));
});

gulp.task('ngConstants:development', function() {
  return gulp.src('app/config.json')
    .pipe(ngConstant({
      constants: {
        config: {
            assetPrefixUrl: "http://localhost:9003",
            branch: "production",
            hashAssets: false,
            copycopter: {
              apiKey: 'API-KEY',
              host:   'copycopter.crowdtap.com'
            },
            loadMoreActions: 5,
            enhance: false
        }
      }
    }))
    .pipe(concat('config.js'))
    .pipe(gulp.dest('public'));
});

gulp.task('ngConstants:production', function() {
  return gulp.src('app/config.json')
    .pipe(ngConstant({
      constants: {
        config: {
            assetPrefixUrl: "//d18w78eemwzu3j.cloudfront.net/<%= fullAppName %>",
            branch: "production",
            hashAssets: false,
            copycopter: {
              apiKey: 'API-KEY',
              host:   'copycopter.crowdtap.com'
            },
            loadMoreActions: 5,
            enhance: {
              host:           '//dgj5ep7xp9u24.cloudfront.net/transform_image/qe/app/<%= appName %>',
              tabletAsMobile: false
            }
        }
      }
    }))
    .pipe(concat('config.js'))
    .pipe(gulp.dest('public'));
});

gulp.task('ngTemplates', function() {
  return gulp.src("app/views/**/*.html")
    .pipe(angularTemplates({
      moduleName: '<%= fullAppName %>',
      rename: function(url) {
        return url.replace(".html", "");
      }
    }))
    .pipe(concat('template.js'))
    .pipe(gulp.dest('public'));
});

gulp.task('wrap', function() {
  return gulp.src('app/**/*.js')
    .pipe(concat('module.js'))
    .pipe(wrapper({ header: "(function () {", footer: "}).call(this);" }))
    .pipe(gulp.dest('public'));
});

gulp.task('shell:runTests', ['lint', 'compileGenerate:test', 'uglify:test'], shell.task('./run_tests.sh'));
gulp.task('shell:runKarma', ['lint', 'compileGenerate:test', 'uglify:test'], shell.task('./node_modules/karma/bin/karma start karma.conf.js --single-run'));

gulp.task('lint', function() {
  return gulp.src(['app/**/*.js', 'features/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function() {
  gulp.watch(['app/**/*.js'], ['lint', 'wrap', 'uglify:development']);
  gulp.watch(['features/**/*.js'], ['lint']);
  gulp.watch(['css/**/*.less'], ['less']);
  gulp.watch(['app/views/**/*.html'], ['ngTemplates', 'uglify:development']);
});

gulp.task('express', ['lint', 'compileGenerate:development', 'uglify:development'], function() {
  nodemon({
    script: './server.js',
    ext:    'html js css',
    watch:  ['server.js', 'spec/factories/index.js']
  })
  .on('restart', function() {
    console.log('Server restarted!');
  });
});

gulp.task('compileGenerate:test', ['less', 'ngTemplates', 'ngConstants:test']);
gulp.task('compileGenerate:development', ['less', 'ngTemplates', 'ngConstants:development']);
gulp.task('compileGenerate:production', ['less', 'ngTemplates', 'ngConstants:production']);

gulp.task('default', ['lint', 'compileGenerate:development', 'wrap', 'uglify:development', 'watch', 'express']);
gulp.task('test', ['lint', 'compileGenerate:test', 'wrap', 'uglify:test', 'shell:runTests']);
gulp.task('production-build', ['compileGenerate:production', 'wrap', 'uglify:production']);
