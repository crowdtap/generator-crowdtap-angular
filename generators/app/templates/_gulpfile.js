var env = process.env.NODE_ENV || 'development';

var gulp    = require('gulp');
var gutil   = require('gulp-util');
var plugins = require('gulp-load-plugins')();
var _       = require('lodash');
var path    = require('path');

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
    .pipe(plugins.if(/\.less$/, plugins.less({
      paths: [
        path.join(__dirname, 'css')
      ]
    })))
    .pipe(plugins.replace(/images/g, '<%= fullAppName %>/images/vendor'))
    .pipe(plugins.autoprefixer('last 3 versions', 'ie 9'))
    .pipe(plugins.concat('application.css'))
    .pipe(plugins.minifyCss())
    .pipe(gulp.dest('public'));
});

gulp.task('constants', function() {
  var constants = require('./config/constants.js')[env];

  return gulp.src('app/config.json')
    .pipe(plugins.ngConstant({
      constants: {
        config: constants
      }
    }))
    .pipe(plugins.concat('config.js'))
    .pipe(gulp.dest('public'));
});

gulp.task('templates', function() {
  return gulp.src("app/views/**/*.html")
    .pipe(plugins.ngHtml2js({
      moduleName: '<%= fullAppName %>',
      rename: function(url) {
        return url.replace(".html", "");
      }
    }))
    .pipe(plugins.concat('template.js'))
    .pipe(gulp.dest('public'));
});

gulp.task('specs', ['js'], function() {
  var javascripts = ["public/jquery.min.js",
                     "public/assets.shared.js",
                     "public/application.js",
                     "spec/**/*_spec.js"];

  return gulp.src(javascripts)
    .pipe(plugins.karma({
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
    .pipe(plugins.cached('scripts'))
    .pipe(plugins.if(function(file) {
      var es6Compat = file.path.match(/app\/.*\.js/);
      return es6Compat;
    }, plugins.babel()))
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.if(env === 'production', plugins.uglify()))
    .pipe(plugins.remember('scripts'))
    .pipe(plugins.concat('application.js', { newLine: ';' }))
    .pipe(gulp.dest('public'));
});

gulp.task('watch', ['css', 'js'], function() {
  gulp.watch('css/**/*', ['css']);
  gulp.watch('app/**/*', ['js']);
  if (env !== 'test') {
    plugins.nodemon({
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

gulp.task('test-server', ['watch'], plugins.shell.task([ './selenium/start' ]));
gulp.task('default', ['css', 'js']);
