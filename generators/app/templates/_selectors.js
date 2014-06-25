"use strict";

module.exports = {
  '^the page$': '#<%= appName %>',

  '^(.*) within (.*)$': function(inner, outer) {
    return "" + (this.selectorFor(outer)) + " " + (this.selectorFor(inner));
  },
  '^within (.*)$': function(path) {
    return "" + (this.selectorFor(path));
  },
  '^the (.*) tag': function(tag_name) {
    return tag_name;
  },
  '^the (.*) element$': function(id) {
    return "#" + (id.dasherize());
  },
  '^the (.*) section$': function(klass) {
    return "." + (klass.dasherize());
  }
};
