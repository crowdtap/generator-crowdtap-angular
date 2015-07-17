/* global Browser */

(function() {
  'use strict';

  var _       = require('underscore');
  var should  = require('should');
  var express = require('express');
  var chalk   = require('chalk');
  var prompt  = require('prompt');
  require('../../spec/factories/index');

  function clearRoutes(_this) {
    _this.app._router.stack = _.reject(_this.app._router.stack, { name: '<anonymous>' });
  }

  module.exports = function() {
    this.World = require('../support/world').World;
    var queue = [];
    var visitParams = {};

    this.Before(function(callback) {
      queue = [];
      visitParams = {};
      this.app = require('../support/world').App;
      this.port = require('../support/world').Port;

      this.app.use(function(req, res, next) {
        queue.push({ verb: req.method, url:  req.url, body: req.body });
        return next();
      });

      this.browser = Browser;
      this.browser.manage().timeouts().setScriptTimeout(100.0 * 1000);
      this.browser.manage().timeouts().pageLoadTimeout(100.0 * 1000);
      this.browser.manage().timeouts().implicitlyWait(3.0 * 1000);
      this.browser.manage().window().setSize(1024, 768);
      this.visitParams = {};
      return callback();
    });

    this.After(function(callback) {
      this.browser.get('about:blank').then((function() {
        return function() {
          return callback();
        };
      })());
      clearRoutes(this);
    });

    this.Given(/^the "([^"]+)" query parameter is set to "([^"]+)"$/, function(name, value, callback) {
      this.visitParams[name] = value;
      callback();
    });

    this.Given(/^the user is on a mobile device$/, function(callback) {
      this.browser.manage().window().setSize(320, 480);
      callback();
    });

    this.Given(/^the stubs are cleared$/, function(callback) {
      clearRoutes(this);
      callback();
    });

    this.Given(/^the "([^"]*)" window parameter is set to "([^"]*)"$/, function(paramName, paramValue, callback) {
      this.browser.executeScript(function(param, value) {
        window[param] = value;
      }, paramName, paramValue).then(callback);
    });

    this.Then(/^I should (not )?see "([^"]*)" ([^:]+)$/, function(negation, text, element, callback) {
      var selector;
      selector = this.selectorFor(element);

      var path = {};
      if (selector.slice(0, 2) === "//") {
        path.xpath = selector;
      } else {
        path.css = selector;
      }

      text = text.replace(/\&quot;/g, '"');
      this.browser.findElement(path).then((function(element) {
        element.isDisplayed().then(function(isVisible) {
          if (isVisible) {
            element.getText().then(function(html) {
              html = html.replace(/[\n\r]/g, ' ').trim().replace(/\s{2,}/g, ' ').toLowerCase();
              text = text.toLowerCase();
              if (typeof negation !== 'undefined') {
                html.should.not.include(text, "found '" + text + "' within '" + selector);
              } else {
                html.should.include(text, "couldn't find '" + text + "' within '" + selector);
              }
              return callback();
            });
          } else if (typeof negation !== 'undefined') {
            return callback();
          } else {
            throw new Error("" + selector + " is not visible on the page");
          }
        });
      }).bind(this));
    });

    this.Then(/^I should (not )?see (.*) element within (.*)$/, function(negation, element1, element2, callback) {
      var selector1, selector2;
      selector1 = this.selectorFor(element1);
      selector2 = this.selectorFor(element2);
      return this.browser.isElementPresent({
        css: "" + selector2 + " " + selector1
      }).then(function(found) {
        if (!negation) {
          negation = "";
        }
        found.should.eql(!negation, "expected to " + negation + " see " + selector2 + " " + selector1);
        return callback();
      });
    });

    this.Then(/^I should (not )?see an? (link|image) linking to "(.*)"(?: (.*))?$/, function(negation, tag, url, element, callback) {
      var selector, selector1, selector2;
      if (element) {
        selector1 = this.selectorFor(element);
      } else {
        selector1 = "";
      }

      if (tag === "link") {
        selector2 = "a[href='" + url + "']";
      } else {
        selector2 = "img[src='" + url + "']";
      }

      selector = selector1 + " " + selector2;
      return this.browser.findElement({
        css: selector
      }).then(function(element) {
        return element.isDisplayed().then(function(isVisible) {
          if (isVisible && typeof negation === 'undefined' || !isVisible && typeof negation !== 'undefined') {
            return callback();
          } else {
            throw new Error("" + selector + " is not visible on the page");
          }
        });
      }, function() {
        if (typeof negation !== 'undefined') {
          return callback();
        } else {
          throw new Error("Could not find " + selector + " on the page");
        }
      });
    });

    this.Then(/^(.*) should be (enabled|disabled)$/, function(namedElement, state, callback) {
      var beEnabled, elem, selector;
      selector = {
        css: this.selectorFor(namedElement)
      };
      elem = this.browser.findElement(selector);
      beEnabled = state !== 'disabled';
      return elem.isEnabled().then(function(enabled) {
        enabled.should.eql(beEnabled);
        return callback();
      });
    });

    this.Then(/^([^:]+) should be (hidden|visible)$/, function(element, visibility, callback) {
      var selector;
      selector = this.selectorFor(element);
      return this.browser.findElement({
        css: selector
      }).then((function(_this) {
        return function(element) {
          return element.isDisplayed().then(function(isVisible) {
            var should_see;
            should_see = visibility !== "hidden";
            _this.assert.equal(should_see, isVisible);
            return callback();
          });
        };
      })(this));
    });

    this.Then(/^(.*) should be at the top of the page$/, function(element, callback) {
      var selector = this.selectorFor(element);

      this.browser.executeScript(function(selector) {
        var element = document.querySelector(selector);
        var rect    = element.getBoundingClientRect();

        return rect.top;
      }, selector).then(function(top) {
        Math.round(top).should.eql(45);
        callback();
      });
    });

    this.When(/^I select "([^"]*)" from (.*)$/, function(selectText, path, callback) {
      var selector;
      selector = this.selectorFor(path);

      var clickLink = function clickLink() {
        this.browser.findElement({
          linkText: selectText
        }).click().then(callback);
      }.bind(this);

      this.browser.findElement({
        css: selector
      }).click().then(clickLink);
    });

    this.When(/^I fill in (.+) with "([^"]*)"$/, function(namedElement, text, callback) {
      var selector = {css: this.selectorFor(namedElement)};
      var element = this.browser.findElement(selector);
      element.clear().then(function() {
        element.sendKeys(text).then(callback);
      });
    });

    this.When(/^I click "([^"]*)"$/, function(text, callback) {
      var element = this.browser.findElement({
        xpath: "//*[contains(text(), '" + text + "')]"
      });

      element.click().then(callback);
    });

    this.When(/^I click ([^"]*)$/, function(path, callback) {
      var selector = this.selectorFor(path);
      var options  = {};

      if (selector.slice(0, 2) === "//") {
        options.xpath = selector;
      } else {
        options.css = selector;
      }

      this.browser.findElement(options).click().then(callback);
    });

    this.Then(/^I wait (\d+) seconds?.*$/, function(count, callback) {
      return this.browser.sleep(1000 * parseInt(count)).then(callback);
    });

    this.Then(/^show me the page$/, function(cb) {
      console.log(chalk.yellow('\nShowing the page'));

      prompt.start();
      prompt.get([{
        name: 'continue',
        description: 'continue [Ynq]'
      }], function(err, result) {
        switch (result.continue.toLowerCase()) {
          case 'n':
          case 'q':
            this.browser.close().then(process.exit);
            break;
          default:
            cb();
        }
      }.bind(this));
    });

    this.Then(/^(.+) should (not )?have (?:the )?"([^"]*)" css class$/, function(selector, negator, cssClass, callback) {
      var cssSelector = this.selectorFor(selector);
      this.browser.findElement({
        css: cssSelector
      }).getAttribute('class').then(function(klass) {
        if (negator) {
          klass.should.not.include(cssClass);
        } else {
          klass.should.include(cssClass);
        }
        return callback();
      });
    });

    this.Then(/^the "([^"]+)" attribute on (.+) should be "([^"]+)"$/, function(attribute, element, value, callback) {
      var cssSelector = this.selectorFor(element);
      value = value.replace(/`/g, '"');
      this.browser.findElement({
        css: cssSelector
      }).getAttribute(attribute).then(function(actual) {
        actual.should.eql(value, "expected " + attribute + " to be " + value);
        return callback();
      });
    });

    this.Then(/^the url of the window should contain "([^"]*)"$/, function(url, callback) {
      var expectedUrl = url;

      this.browser.getCurrentUrl().then((function(actualUrl) {
        should.exist(actualUrl.match(expectedUrl));
        callback();
      }));
    });

    // Write your API steps below this

    this.Given(/^(?:a (.*) request to )?the "([^"]+)" API endpoint returns the following(?: (.*)):$/, function(httpAction, path, factory, response, callback) {
      var object;
      if (factory === "JSON") {
        object = JSON.parse(response);
      } else {
        object = this.Factory(factory, JSON.parse(response));
      }
      apiResponse.bind(this)(path, httpAction, object);

      callback();
    });

    this.Given(/^(?:a (.*) request to )?the "([^"]+)" API endpoint returns with a "(\d+)" status$/, function(httpAction, path, httpStatus, callback) {
      apiResponse.bind(this)(path, httpAction, httpStatus);
      callback();
    });

    this.Then(/^I should (not )?have made a (.*) request to "([^"]*)" with the following (.*) params:$/, function(negation, verb, url, factory, params, callback) {
      if (typeof(params) === 'function') {
        callback = params;
        params = undefined;
      } else {
        params = this.Factory(factory, JSON.parse(params));
      }

      checkRequests(negation, verb, url, params, callback);
    });

    this.Then(/^I should (not )?have made a (.*) request to "([^"]*)"(?: with params:)?$/, function(negation, verb, url, params, callback) {
      if (typeof(params) === 'function') {
        callback = params;
        params = undefined;
      } else {
        params = JSON.parse(params);
      }

      checkRequests(negation, verb, url, params, callback);
    });

    var checkRequests = function(negation, verb, url, params, callback) {
      var match  = false;
      var actual = {verb: null, params: null};
      var retries = 10;

      var interval = setInterval(function() {
        retries -= 1;
        if (match || retries < 0) {
          if (negation) {
            match.should.eql(false, "unexpected " + verb + " request made to " + url + " with " + params);
          } else {
            match.should.eql(true, verb + " request not made to " + url + " with " + JSON.stringify(params, null, 2) + ", actual request was " + actual.verb + " with " + JSON.stringify(actual.params, null, 2));
          }
          clearInterval(interval);
          return callback();
        } else {
          queue.forEach(function(element) {
            if (element.url === url) {
              actual.verb = element.verb;
              actual.params = element.body;
            }
            if (actual.verb === verb && element.url === url) {
              if (!params || compareObjects(params, actual.params)) {
                match = true;
              }
            }
          }.bind(this), 100);
        }
      }.bind(this));
    };

    var compareObjects = function(expected, actual) {
      var match = true;
      var BreakException = {};

      if (Object.keys(expected).length !== Object.keys(actual).length) {
        // Uncomment this to debug
        // console.log();
        // console.log("Expected: " + Object.keys(expected).sort().join(", "));
        // console.log("Actual: " + Object.keys(actual).sort().join(", "));
        // console.log();
        // console.log("Expected: " + JSON.stringify(expected));
        // console.log("Actual: " + JSON.stringify(actual));
        return false;
      }

      try {
        Object.keys(expected).forEach(function(key) {
          if (!match || typeof expected[key] !== typeof actual[key]) {
            // console.log(typeof expected[key]);
            // console.log(typeof actual[key]);
            match = false;
            throw BreakException;
          }

          if (expected[key] === null) {
            match = actual[key] === null;
          } else if (typeof expected[key] === 'object') {
            match = compareObjects(expected[key], actual[key]);
          } else if (expected[key] !== actual[key]) {
            // Uncomment this to debug
            // console.log();
            // console.log("Invalid parameter:");
            // console.log(key);
            // console.log("Expected: " + expected[key]);
            // console.log("Actual: " + actual[key]);

            match = false;
          }
        });
      } catch(e) {
        if (e !== BreakException) {
          throw e;
        }
      }

      return match;
    };

    var apiResponse = function apiResponse(path, httpAction, response) {
      var action = httpAction || "GET";
      this.app[action.toLowerCase()](path, function(req, res) {
        if (typeof(response) === 'object') {
          res.json(response);
        } else {
          res.send(response);
        }
      });
    };
  };
}).call(this);
