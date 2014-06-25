var util   = require('util');
var path   = require('path');
var _s     = require('underscore.string')
var chalk  = require('chalk');
var yeoman = require('yeoman-generator');

var CrowdtapAngularGenerator = yeoman.generators.Base.extend();

CrowdtapAngularGenerator.prototype.getAppName = function() {
  var done = this.async();

  console.log(this.yeoman);

  var prompts = [
    {
      name: 'appName',
      message: "Enter the name of your app. It will automatically be prefixed with 'crowdtap':"
    },
    {
      name: 'appPort',
      message: "Enter the port number your app will run on locally:"
    }
  ]
  this.prompt(prompts, function(props) {
    this.appName = props.appName;
    this.appPort = props.appPort;
    done();
  }.bind(this));
};

CrowdtapAngularGenerator.prototype.createStructure = function() {
  this.fullAppName = 'crowdtap.' + this.appName;
  this.camelizedAppName = _s.camelize(this.appName);

  this.mkdir(this.fullAppName);
  process.chdir(process.cwd() + '/' + this.fullAppName);

  this.mkdir('app');
  this.mkdir('app/services');
  this.mkdir('app/controllers');
  this.mkdir('app/views');

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

  this.template('_app.js', 'app/app.js');
  this.template('_directives.js', 'app/directive.js');
  this.template('_filters.js', 'app/filters.js');
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
    + chalk.yellow('*') + 'Add the copycopter API KEY for your project to the gulpfile'
    + '\n'
    + chalk.yellow('*') + 'Add the circleci API KEY for your project to the circle.yml file (Ask the DevOps team for this)'
    + '\n'
    + chalk.yellow('*') + 'The public.html file is just a template. Make sure your set it up the way the page is served by rails'
    + chalk.red('\n============================================\n')

  console.log(output);
};
module.exports = CrowdtapAngularGenerator
