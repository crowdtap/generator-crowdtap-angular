/* global Browser */

(function() {
  'use strict';

  var express, should, _;

  _       = require('underscore');
  should  = require('should');
  express = require('express');
  require('../../spec/factories/index');

  module.exports = function() {
    this.World = require('../support/world').World;

    this.Before(function(callback) {
      this.app = require('../support/world').App;
      this.port = require('../support/world').Port;
      this.browser = Browser;
      this.browser.manage().timeouts().setScriptTimeout(100.0 * 1000);
      this.browser.manage().timeouts().pageLoadTimeout(100.0 * 1000);
      this.browser.manage().timeouts().implicitlyWait(3.0 * 1000);
      this.visitParams = {};
      return callback();
    });

    this.After(function(callback) {
      this.browser.get('about:blank').then((function() {
        return function() {
          return callback();
        };
      })());
      this.app.routes.get = [];
      this.app.routes.post = [];
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
      return this.browser.findElement(path).then((function(element) {
        return element.isDisplayed().then(function(isVisible) {
          if (isVisible) {
            return element.getText().then(function(html) {
              html = html.replace(/[\n\r]/g, ' ').trim().replace(/\s{2,}/g, ' ');
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
        found.should.eql(!negation);
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

    this.When(/^I select "([^"]*)" from (.*)$/, function(selectText, path, callback) {
      var selector;
      selector = this.selectorFor(path);
      this.browser.findElement({
        css: selector
      }).click();
      this.browser.findElement({
        linkText: selectText
      }).click();
      return callback();
    });

    this.When(/^I click (.*)$/, function(path, callback) {
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

    // Write your API steps below this

  };
}).call(this);
