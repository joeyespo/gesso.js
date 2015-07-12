var os = require('os');
var path = require('path');
var moment = require('moment');
var chalk = require('chalk');
var nunjucks = require('nunjucks');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var builder = require('./builder');
var watcher = require('./watcher');
var settings = require('./settings');
var utils = require('./utils');
var Builder = builder.Builder;
var Watcher = watcher.Watcher;


function createApp(builder, logAll) {
  // Express application
  var app = express();

  // Attach watcher
  app.watcher = watcher || null;

  // Middleware
  app.use(bodyParser.urlencoded({extended: false}));
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
      ('[' + moment().format('DD/MMM/YYYY HH:mm:ss') + '] ') +
      (tokens.method(req, res, 'undefined') || '-') + ' ' +
      (tokens.url(req, res, 'undefined') || '-') + ' ' +
      (tokens.status(req, res, 'undefined') || '-') + ' ' +
      (tokens.res(req, res, 'content-length') || '-') + '\u001b[0m');
  }, {
    skip: function (req, res) {
      if (utils.startsWith(req.url, '/log')) {
        return true;
      }
      return !logAll && (
        utils.startsWith(req.url, '/images') || utils.startsWith(req.url, '/scripts') ||
        utils.startsWith(req.url, '/styles') || utils.startsWith(req.url, '/vendor'));
    }
  }));
  app.use(express.static(path.join(__dirname, 'public')));

  // Configure extensions
  nunjucks.configure(path.join(__dirname, 'views'));

  // Routes
  app.get('/', function(req, res) {
    builder.ready(function(err) {
      // TODO: Get values from project settings
      res.type('html');
      res.end(nunjucks.render('index.html', {
        gessoScript: '/gesso-bundle.js',
        gessoProjectName: builder.projectName,
        gessoBuildError: err ? (err.message || String(err)) + os.EOL : null,
        canvasId: settings.CANVAS_ID,
        canvasWidth: settings.CANVAS_WIDTH,
        canvasHeight: settings.CANVAS_HEIGHT
      }));
    });
  });

  app.get('/gesso-bundle.js', function(req, res) {
    res.type('js');
    builder.ready(function(err, output) {
      res.end(output || '');
    });
  });

  app.post('/log', function(req, res) {
    if (!req.body || typeof req.body.message === 'undefined') {
      res.status(400);
      res.end('No "message" form field specified.');
      return;
    }

    var level = req.body.level || 'log';
    var messages = req.body.message.split('\n');
    for (var index = 0; index < messages.length; index++) {
      var message = '[' + moment().format('DD/MMM/YYYY HH:mm:ss') + '] Client: ' + messages[index];
      if (level === 'error') {
        message = chalk.bold.red(message);
      } else if (level === 'warn') {
        message = chalk.bold.yellow(message);
      } else if (level === 'info') {
        message = chalk.bold.cyan(message);
      } else {
        message = chalk.white(message);
      }
      console.log(message);
    }
    res.end('');
  });

  return app;
}


function serve(options) {
  options = options || {};

  // Create builder and watcher
  var builder = new Builder(options.packagePath);
  var watcher = new Watcher(builder);

  // Create the app
  var app = createApp(builder, options.logAll);

  // Run first build
  builder.build();

  // Run the server
  var port = options.port || settings.PORT;
  var host = options.host || settings.HOST;
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
