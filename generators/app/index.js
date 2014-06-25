var util = require('util');
var path = require('path');
var _s   = require('underscore.string')

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

  this.mkdir('features');
  this.mkdir('features/step_definitions');
  this.mkdir('features/support');

  this.mkdir('public');

  this.mkdir('spec');
  this.mkdir('factories');
};

CrowdtapAngularGenerator.prototype.copyFiles = function() {
  this.template('_server.js', 'server.js');
  this.template('_package.json', 'package.json');
  this.template('_bower.json', 'bower.json');
  this.template('_gulpfile.js', 'gulpfile.js');
  this.copy('_parachute.json', 'parachute.json');
  this.copy('_circle.yml', 'circle.yml');
  this.copy('_node-version', '.node-version');

  this.template('_app.js', 'app/app.js');
  this.template('_directives.js', 'app/directive.js');
  this.template('_filters.js', 'app/filters.js');
}
module.exports = CrowdtapAngularGenerator
