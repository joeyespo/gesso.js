var path = require('path');
var nunjucks = require('nunjucks');
var express = require('express');
var settings = require('./settings');


// Express application
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
// Configure extension
nunjucks.configure(path.join(__dirname, 'views'));


// Routes
app.get('/', function(req, res) {
  res.end('Gesso!');
});


function serve(path) {
  // Run the server
  app.listen(settings.PORT, settings.HOST, function() {
    console.log(' * Listening on http://%s:%d/', settings.HOST, settings.PORT);
  });
}


module.exports = {
  serve: serve
};
