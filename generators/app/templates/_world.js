(function() {
  'use strict';

  var App, Factory, Port, Server, World, assert, express, path, selectors, sprintf, _;

  Factory   = require('rosie').Factory;
  assert    = require('assert');
  path      = require('path');
  express   = require('express');
  selectors = require('./selectors');
  sprintf   = require('sprintf');
  _         = require('underscore');
  require('../../spec/factories/index');

  if (process.env.SEQ) {
    Port = "93" + (sprintf("%02s", process.env.SEQ));
  }

  Port = Port || (Port = 9297);
  App = express();
  App.use(express.static(path.join(process.cwd(), 'public')));
  Server = App.listen(Port);
  App.use(express.bodyParser());
  App.set('views', './public');
  App.engine('.html', require('consolidate').hogan);

  World = (function() {
    function World(callback) {
      this.assert = assert;
      this.queue = [];
      callback();
    }

    World.prototype.selectorFor = function(locator) {
      var local_path, match, regexp, scope;
      for (regexp in selectors) {
        local_path = selectors[regexp];
        regexp = new RegExp(regexp);
        scope = '';
        match = locator.match(regexp);
        if (typeof match !== 'undefined' && match !== null) {
          if (typeof local_path === 'string') {
            scope = local_path;
          } else {
            scope = local_path.apply(this, match.slice(1));
          }
          return scope;
        }
      }
      throw new Error("Could not find path for '" + locator + "'");
    };

    World.prototype.Factory = function(factoryName, options) {
      var err, key, value;
      for (key in options) {
        value = options[key];
        try {
          options[key] = JSON.parse(value);
        } catch (_error) {
          err = _error;
        }
      }
      return Factory.build(factoryName, options);
    };

    return World;

  })();

  module.exports.World = World;
  module.exports.Port = Port;
  module.exports.App = App;

}).call(this);
