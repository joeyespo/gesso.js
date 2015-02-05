var os = require('os');
var path = require('path');
var moment = require('moment');
var chalk = require('chalk');
var nunjucks = require('nunjucks');
var express = require('express');
var morgan = require('morgan');
var builder = require('./builder');
var watcher = require('./watcher');
var settings = require('./settings');
var Builder = builder.Builder;
var Watcher = watcher.Watcher;


function createApp(builder) {
  // Express application
  var app = express();

  // Attach watcher
  app.watcher = watcher || null;

  // Middleware
  app.use(morgan(function (tokens, req, res) {
    var status = res.statusCode;
    var color;
    if (status === 404) { color = 33; }       // yellow
    else if (status === 304) { color = 36; }  // cyan
    else if (status >= 500) { color = 95; }   // magenta
    else if (status >= 400) { color = 91; }   // red
    else if (status >= 300) { color = 32; }   // green
    else { color = 90; }                      // dark gray (gray = 37)
    return ('\u001b[' + color + 'm' +
      ('[' + moment().format('DD/MMM/YYYY HH:mm:ss') + ']') + ' ' +
      (tokens.method(req, res, 'undefined') || '-') + ' ' +
      (tokens.url(req, res, 'undefined') || '-') + ' ' +
      (tokens.status(req, res, 'undefined') || '-') + ' ' +
      (tokens.res(req, res, 'content-length') || '-') + '\u001b[0m');
  }));
  app.use(express.static(path.join(__dirname, 'public')));

  // Configure extensions
  nunjucks.configure(path.join(__dirname, 'views'));

  // Routes
  app.get('/', function(req, res) {
    builder.ready(function(err) {
      var canvasId = settings.CANVAS_ID;
      var canvasWidth = settings.CANVAS_WIDTH;
      var canvasHeight = settings.CANVAS_HEIGHT;

      // TODO: Get values from project settings
      // TODO: Provide errors and build content

      var gessoBuildError = err ? (err.message || String(err)) + os.EOL : null;

      res.type('html');
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
    res.type('js');
    builder.ready(function(err, output) {
      res.end(output || '');
    });
  });

  // Log failed requests
  app.use(function(err, req, res, next) {
    console.log(res.statusCode);
    console.log(chalk.red(err));
    next();
  });

  return app;
}


function serve(port, host, options) {
  if (typeof options === 'undefined') {
    if (typeof host === 'object') {
      options = host;
      host = undefined;
    } else if (typeof host === 'undefined' && typeof port === 'object') {
      options = port;
      port = undefined;
    }
  }

  port = port || settings.PORT;
  host = host || settings.HOST;

  // Create builder and watcher
  var builder = new Builder(options.packagePath);
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
