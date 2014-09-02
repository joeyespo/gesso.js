var path = require('path');
var nunjucks = require('nunjucks');
var express = require('express');
var builder = require('./builder');
var watcher = require('./watcher');
var settings = require('./settings');
// Unpack
var Builder = builder.Builder;
var Watcher = watcher.Watcher;


function createApp(builder) {
  // Express application
  var app = express();
  // Attach watcher
  app.watcher = watcher || null;
  // Middleware
  app.use(express.static(path.join(__dirname, 'public')));
  // Configure extensions
  nunjucks.configure(path.join(__dirname, 'views'));

  // Routes
  app.get('/', function(req, res) {
    builder.ready(function() {
      var canvasClass = settings.CANVAS_CLASS;
      var canvasWidth = settings.CANVAS_WIDTH;
      var canvasHeight = settings.CANVAS_HEIGHT;

      // TODO: Get values from project settings
      // TODO: Provide errors and build content

      res.end(nunjucks.render('index.html', {
        canvasClass: canvasClass,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight
      }));
    });
  });

  return app;
}


function serve(packagePath) {
  // TODO: Resolve root path
  if (!packagePath) {
    packagePath = process.cwd();
  }

  // Create builder and watcher
  var builder = new Builder(packagePath);
  var watcher = new Watcher(packagePath, builder);

  // Create the app
  var app = createApp(watcher);

  // Run first build
  builder.build();

  // Run the server
  app.listen(settings.PORT, settings.HOST, function() {
    console.log(' * Listening on http://%s:%d/', settings.HOST, settings.PORT);

    // Start watching
    watcher.watch();
  });

  return app;
}


module.exports = {
  createApp: createApp,
  serve: serve
};
