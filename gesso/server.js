var path = require('path');
var nunjucks = require('nunjucks');
var express = require('express');
var build = require('./build');
var settings = require('./settings');


function createApp(watcher) {
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
    watcher.whenReady(function() {
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
  });

  return app;
}


function serve(packagePath) {
  // TODO: Resolve root path
  if (!packagePath) {
    packagePath = process.cwd();
  }

  // Create the watcher
  var watcher = build.watch(packagePath);

  // Create the app
  var app = createApp(watcher);

  // Run the server
  app.listen(settings.PORT, settings.HOST, function() {
    console.log(' * Listening on http://%s:%d/', settings.HOST, settings.PORT);
    // Start first build
    watcher.rebuild();
  });

  return app;
}


module.exports = {
  createApp: createApp,
  serve: serve
};
