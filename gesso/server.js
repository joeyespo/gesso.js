var os = require('os');
var path = require('path');
var chalk = require('chalk');
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

  app.use(function(req, res, next) {
    next();
    console.log(chalk.gray([
      '[' + new Date().toISOString().split('.')[0].replace('T', ' ') + ']',
      res.statusCode + ' -',
      '"' + req.method + ' ' + req.url + ' HTTP/' + req.httpVersion + '"',
      res.statusCode,
      '-',
    ].join(' ')));
  });

  // Routes
  app.get('/', function(req, res) {
    builder.ready(function(err) {
      var canvasId = settings.CANVAS_ID;
      var canvasWidth = settings.CANVAS_WIDTH;
      var canvasHeight = settings.CANVAS_HEIGHT;

      // TODO: Get values from project settings
      // TODO: Provide errors and build content

      var gessoBuildError = err ? (err.message || String(err)) + os.EOL : null;

      res.end(nunjucks.render('index.html', {
        gessoScript: '/gesso-bundle.js',
        gessoProjectName: builder.projectName,
        gessoBuildError: gessoBuildError,
        canvasId: canvasId,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight
      }));
    });
  });

  app.get('/gesso-bundle.js', function(req, res) {
    builder.ready(function(err, output) {
      res.end(output || '');
    });
  });

  return app;
}


function serve(port, host, packagePath) {
  port = port || settings.PORT;
  host = host || settings.HOST;

  // Create builder and watcher
  var builder = new Builder(packagePath);
  var watcher = new Watcher(builder);

  // Create the app
  var app = createApp(builder);

  // Run first build
  builder.build();

  // Run the server
  app.listen(port, host, function() {
    console.log(' * Listening on http://%s:%d/', host, port);

    // Start watching
    watcher.watch();
  });

  return app;
}


module.exports = {
  createApp: createApp,
  serve: serve
};
