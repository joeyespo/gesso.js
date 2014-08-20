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
  var canvasClass = settings.CANVAS_CLASS;
  var canvasWidth = settings.CANVAS_WIDTH;
  var canvasHeight = settings.CANVAS_HEIGHT;

  // TODO: Get values from project settings

  res.end(nunjucks.render('index.html', {
    canvasClass: canvasClass,
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight
  }));
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
