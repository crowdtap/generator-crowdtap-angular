(function() {
  var Factory, app, express, fs, path, _;

  express = require('express');
  _ = require('underscore');
  fs = require('fs');
  path = require('path');
  Factory = require('rosie').Factory;
  require('./spec/factories/index');

  app = express();
  app.use(express.bodyParser());
  app.use(express.static('./public'));

  /* uncomment the template below to define the routes
   * that your server responds to
   *
  app.get('/path/to/endpoint', function(req, res) {
    res.send(200);
  });
  */

  app.listen(<%= appPort %>);

  module.exports = app;

}).call(this);
