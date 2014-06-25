"use strict";

(function() {
  var App, Factory, Port, Server, World, assert, express, path, selectors, sprintf, _;

  Factory   = require('rosie').Factory;
  assert    = require('assert');
  path      = require('path');
  express   = require('express');
  selectors = require('./selectors');
  sprintf   = require('sprintf');
  _         = require('underscore');
  require('./core_ext');
  require('../../spec/factories/index');

  if (process.env.SEQ) {
    Port = "93" + (sprintf("%02s", process.env.SEQ));
  }

  Port = Port || (Port = 9297);
  App = express();
  App.use(express.static(path.join(process.cwd(), 'public')));
  Server = App.listen(Port);
  App.use(express.bodyParser());

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

    World.prototype.check_queue = function() {
      var request, _i, _len, _ref;
      if (this.queue.length !== 0) {
        console.log("You did not make the following requests!");
        _ref = this.queue;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          request = _ref[_i];
          console.log("" + request.verb + ", " + request.path);
        }
        throw new Error("Unfulfilled requests");
      }
    };

    World.prototype.remove_from_queue = function(verb, path) {
      var index, request, _i, _len, _ref, _results;
      _ref = this.queue;
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        request = _ref[index];
        if ((request !== null) && request.verb === verb && request.url === path) {
          _results.push(this.queue.splice(index, 1));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    World.prototype.reset_path = function(verb, path, app) {
      var index, route, _i, _len, _ref, _results;
      if (app.routes[verb]) {
        _ref = app.routes[verb];
        _results = [];
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          route = _ref[index];
          if (route.path === path) {
            app.routes[verb].splice(index, 1);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    World.prototype.matchRequest = function(verb, url, table, topLevel, callback) {
      var actualParams, actualUrl, expectedParams, k, key, match, param, queryStr, request, temp, val, value, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4;
      match = false;
      expectedParams = {};
      actualParams = {};
      _ref = this.queue;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        request = _ref[_i];
        if (request !== null) {
          _ref1 = request.url.split('?'); actualUrl = _ref1[0]; queryStr = _ref1[1];
          if (request.verb === verb && actualUrl === url) {
            expectedParams = table.hashes()[0];
            if (typeof queryStr !== 'undefined') {
              _ref2 = queryStr.split('&');
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                param = _ref2[_j];
                _ref3 = param.split('='); key = _ref3[0]; val = _ref3[1];
                actualParams[key] = val;
              }
            } else if (!_.isEmpty(request.body)) {
              _ref4 = request.body;
              for (key in _ref4) {
                value = _ref4[key];
                if (typeof value === "object") {
                  actualParams[key] = value;
                } else {
                  actualParams[key] = value.toString();
                }
              }
            }

            var _regexp = new RegExp("^`");
            for (k in expectedParams) {
              var _v = expectedParams[k];
              if (_v.match(_regexp)) {
                expectedParams[k] = JSON.parse(expectedParams[k].slice(1));
              } else {
                expectedParams[k] = "" + expectedParams[k];
              }

              if (expectedParams[k] === "true") {
                expectedParams[k] = true;
              } else if (expectedParams[k] === "false") {
                expectedParams[k] = false;
              }
            }

            if (topLevel !== null) {
              temp = {};
              temp[topLevel] = expectedParams;
              expectedParams = temp;
            }

            match = _.isEqual(expectedParams, actualParams);

            if (match) {
              this.remove_from_queue(request.verb, request.url);
            } else {
              console.log("");
              console.log("Expected: " + (JSON.stringify(expectedParams)));
              console.log("Actual:   " + (JSON.stringify(actualParams)));
              throw new Error("" + request.url + " did not match params");
            }
          }
        }
      }
      match.should.eql(true, "No matching " + verb + " request found for " + url);
      return callback();
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
