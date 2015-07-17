(function() {
  'use strict';

  var Factory    = require('rosie').Factory;
  var bodyParser = require('body-parser');
  var assert     = require('assert');
  var path       = require('path');
  var express    = require('express');
  var selectors  = require('./selectors');
  var sprintf    = require('sprintf');
  var _          = require('underscore');
  require('../../spec/factories/index');

  if (process.env.SEQ) {
    Port = "93" + (sprintf("%02s", process.env.SEQ));
  }

  Port = Port || (Port = 9297);
  App = express();
  App.use(express.static(path.join(process.cwd(), 'public')));
  Server = App.listen(Port);
  App.use(bodyParser.json());
  App.set('views', './public');
  App.use(bodyParser.urlencoded({ extended: true }));

  World = (function() {
    function World(callback) {
      this.assert = assert;
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
