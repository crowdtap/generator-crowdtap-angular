"use strict";

var util   = require('util');
var path   = require('path');
var _s     = require('underscore.string');
var chalk  = require('chalk');
var yeoman = require('yeoman-generator');

var CrowdtapAngularGenerator = yeoman.generators.Base.extend();

CrowdtapAngularGenerator.prototype.getAppName = function() {
  var done = this.async();
  var logo = ["   ______                       ____            ",
              "  / _____________ _      ______/ / /_____ _____ ",
              " / /   / ___/ __ | | /| / / __  / __/ __ `/ __ \\",
              "/ /___/ /  / /_/ | |/ |/ / /_/ / /_/ /_/ / /_/ /",
              "\____/_/   \____/|__/|__/\__,_/\__/\__,_/ .___/ ",
              "                                       /_/      "].join("\n");
  console.log(logo);
  console.log("Welcome to the Crowdtap Angular Generator\n\n");

  var prompts = [
    {
      name: 'appPrefix',
      message: "Enter the prefix for your app (crowdtap, socialstars etc):"
    },
    {
      name: 'appName',
      message: "Enter the name of your app. It will automatically be prefixed with the prefix you entered before:"
    },
    {
      name: 'appPort',
      message: "Enter the port number your app will run on locally:"
    },
    {
      name: 'sentrySetup',
      message: ["Please visit https://crowdtap.atlassian.net/wiki/display/EN/2014/10/16/Sentry+Part+I%3A+Migration",
      "follow the instructions under 'Front end apps' and 'integrations'",
      "enter 'yes' if you have set up Sentry for your new app:"].join('\n')
    }
  ];
  this.prompt(prompts, function(props) {
    this.appPrefix = props.appPrefix;
    this.appName   = props.appName;
    this.appPort   = props.appPort;
    done();
  }.bind(this));
};

CrowdtapAngularGenerator.prototype.createStructure = function() {
  this.fullAppName = this.appPrefix + '.' + this.appName;
  this.camelizedAppName = _s.camelize(this.appName);

  this.mkdir(this.fullAppName);
  process.chdir(process.cwd() + '/' + this.fullAppName);

  this.mkdir('app');
  this.mkdir('app/directives');
  this.mkdir('app/services');
  this.mkdir('app/controllers');
  this.mkdir('app/views');

  this.mkdir('config');

  this.mkdir('css');
  this.mkdir('css/base');
  this.mkdir('css/components');

  this.mkdir('features');
  this.mkdir('features/step_definitions');
  this.mkdir('features/support');

  this.mkdir('public');

  this.mkdir('spec');
  this.mkdir('spec/factories');
};

CrowdtapAngularGenerator.prototype.copyFiles = function() {
  this.template('_README.md', 'README.md');
  this.template('_server.js', 'server.js');
  this.template('_package.json', 'package.json');
  this.template('_bower.json', 'bower.json');
  this.template('_gulpfile.js', 'gulpfile.js');
  this.copy('_parachute.json', 'parachute.json');
  this.copy('_circle.yml', 'circle.yml');
  this.copy('_node-version', '.node-version');
  this.copy('_bowerrc', '.bowerrc');
  this.copy('_karma.conf.js', 'karma.conf.js');
  this.copy('_install-firefox.sh', 'install-firefox.sh');
  this.copy('_gitignore', '.gitignore');

  this.template('_app.js', 'app/app.js');
  this.template('_directive.js', 'app/directives/directive.js');
  this.template('_filters.js', 'app/filters.js');
  this.template('_constants.js', 'config/constants.js');
  this.template('_config.json', 'app/config.json');

  this.template('_steps.js', 'features/step_definitions/steps.js');
  this.template('_selectors.js', 'features/support/selectors.js');
  this.template('_world.js', 'features/support/world.js');

  this.template('_factory_index.js', 'spec/factories/index.js');

  this.template('_public_index.html', 'public/index.html');
  this.copy('_jquery.min.js', 'public/jquery.min.js');

  this.template('_css_index.less', 'css/index.less');
  this.template('_base.less', 'css/base/base.less');
};

CrowdtapAngularGenerator.prototype.done = function() {
  var output = '\n'
    + chalk.yellow('\nSweet!') + ' You are almost done. \n'
    + '\n'
    + chalk.yellow('There are still a few things you need to do')
    + chalk.red('\n============================================\n')
    + chalk.yellow('*') + 'Run npm install'
    + '\n'
    + chalk.yellow('*') + 'Ask the DevOps team to setup your project on circle'
    + '\n'
    + chalk.yellow('*') + 'Make sure to add the karma task to the test task in the gulp file if you have specs'
    + '\n'
    + chalk.yellow('*') + 'The public.html file is just a template. Make sure your set it up the way the page is served by rails'
    + chalk.red('\n============================================\n');

  console.log(output);
};
module.exports = CrowdtapAngularGenerator;
