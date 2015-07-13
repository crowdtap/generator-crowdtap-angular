(function() {
  var express = require('express');
  var _ = require('underscore');
  var fs = require('fs');
  var path = require('path');
  var Factory = require('rosie').Factory;
  var bodyParser = require('body-parser');
  require('./spec/factories/index');

  var app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static('./public'));

  /* uncomment the template below to define the routes
   * that your server responds to
   *
  app.get('/path/to/endpoint', function(req, res) {
    res.send(200);
  });
  */

  app.listen(<%= appPort %>);
}).call(this);
