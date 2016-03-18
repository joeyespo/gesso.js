var fs = require('fs');
var path = require('path');
var esprima = require('esprima');
var through = require('through');
var browserify = require('browserify');
var utils = require('./utils');

var PACKAGE_FILE = 'package.json';
var DEFAULT_ENTRY_POINT = 'index.js';
var DEFAULT_PROJECT_NAME = 'gesso-bundle';

function _BuildRef() {
}

function Builder(entryPoint) {
  this.packagePath = null;
  this.projectName = null;
  this.entryPoint = null;
  this.path = null;
  this._readyQueue = [];
  this._latestBuild = null;
  this._lastOutput = null;
  this._lastError = null;
  this._resolvePaths(entryPoint);
}
Builder.prototype._resolvePaths = function(fileOrPath) {
  if (typeof fileOrPath === 'undefined') {
    fileOrPath = '.';
  }

  // Try reading entry point from package
  var projectName = null;
  var entryPoint = null;
  if (fileOrPath === '.' || fs.lstatSync(fileOrPath).isDirectory()) {
    var packagePath = path.resolve(path.join(fileOrPath, PACKAGE_FILE));
    try {
      var pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      projectName = pkg.name;
      entryPoint = pkg.main;
    } catch(ex) {
    }
    if (entryPoint) {
      this.packagePath = packagePath;
    } else {
      entryPoint = path.join(fileOrPath, DEFAULT_ENTRY_POINT);
    }
  } else {
    entryPoint = fileOrPath;
  }

  this.entryPoint = path.resolve(entryPoint);
  this.path = path.dirname(this.entryPoint);
  this._resolveProjectName();
};
Builder.prototype._resolveProjectName = function() {
  // Try reading entry point from package
  var projectName = null;
  try {
    projectName = JSON.parse(fs.readFileSync(path.join(this.path, PACKAGE_FILE), 'utf8')).name;
  } catch(ex) {
  }
  if (!projectName) {
    var dirName = path.basename(path.dirname(this.entryPoint));
    projectName = dirName.slice(0, dirName.length - path.extname(dirName).length);
  }
  // TODO: Slugify the name? -> Remove dangerous characters like '/'
  this.projectName = projectName;
};
Builder.prototype._prebuild = function() {
  var latestBuild = new _BuildRef();
  this._latestBuild = latestBuild;
  return latestBuild;
};
Builder.prototype._postbuild = function(err, output) {
  var readyQueue = this._readyQueue;

  this._latestBuild = null;
  this._readyQueue = [];
  this._lastOutput = output;
  this._lastError = err;

  // Call all ready callbacks
  for (var index = 0; index < readyQueue.length; index++) {
    var callback = readyQueue[index];
    try {
      callback(err, output);
    } catch(ex) {
      console.log('Error in ready callback: ' + ex);
    }
  }
};
Builder.prototype._formatSyntaxError = function(err, filename, code) {
  // Get line of code
  var lineStartIndex = code.lastIndexOf('\n', err.index) + 1;
  var lineEndIndex = code.indexOf('\n', err.index);
  if (lineEndIndex === -1) {
    lineEndIndex = code.length;
  }
  var line = code.substring(lineStartIndex, lineEndIndex);
  var position = err.column - 1;

  // Show marker within trimmed window
  var snippet;
  var snippetPosition;
  if (position <= 69) {
    snippet = line.substr(0, 79);
    snippetPosition = position;
  } else if (line.length - position < 10) {
    snippet = line.substr(line.length - 79, 79);
    snippetPosition = 79 - (line.length - position);
  } else {
    snippet = line.substr(position - 69, 79);
    snippetPosition = 69;
  }

  // Get code marker
  var marker = '';
  while (marker.length < snippetPosition) {
    marker += ' ';
  }
  marker += '^';

  return new Error([
    filename + ':' + err.lineNumber,
    snippet,
    marker,
    'SyntaxError: ' + err.description,
  ].join('\n'));
};
Builder.prototype.isBuilding = function() {
  return this._latestBuild !== null;
};
Builder.prototype.lastOutput = function() {
  return this._lastOutput;
};
Builder.prototype.lastError = function() {
  return this._lastError;
};
Builder.prototype.ready = function(callback) {
  // Enqueue callback if building, otherwise call immediately
  if (this.isBuilding()) {
    this._readyQueue.push(callback);
  } else {
    callback(this._lastError, this._lastOutput);
  }
};
Builder.prototype.build = function(callback) {
  var self = this;

  // Resolve paths again in case the project name changed
  self._resolveProjectName();

  var currentBuild = self._prebuild();
  var basedir = path.dirname(self.entryPoint);
  var entryPoint = './' + path.relative(basedir, self.entryPoint);

  // TODO: Add bootstrap code to check if entry point exported a Gesso object
  //       and if so, run .start() on it with the page's only canvas (or matching ID)
  browserify(entryPoint, {
    basedir: basedir,
    debug: true
  }).transform(function (filename) {
    // Skip translating .json files
    // TODO: Use JSON syntax checker
    // TODO: Syntax check .js file instead of skipping .json files? -> What about 3rd-party syntaxes?
    if (utils.endsWith(filename, '.json')) {
      return through();
    }
    // Check syntax errors
    var code = '';
    return through(function write(buf) {
      code += buf;
    }, function end() {
      // TODO: Use Gesso plugins to provide custom transforms
      //       e.g. CoffeeScript, PureScript, etc
      // Validate JavaScript file
      try {
        var syntax = esprima.parse(code, {tolerant: true});
        if (syntax.errors.length !== 0) {
          self._postbuild(new Error(syntax.errors.map(function(err) {
            return self._formatSyntaxError(err, filename, code).message;
          }).join('\n\n')));
        }
      } catch (e) {
        self._postbuild(self._formatSyntaxError(e, filename, code));
      }
      this.queue(code);
      this.queue(null);
    });
  }).bundle(function (err, output) {
    // Run post-build if this is the latest
    if (currentBuild === self._latestBuild) {
      self._postbuild(err, output);
    }
    // Always call callback of current build
    if (typeof callback === 'function') {
      callback(err, output);
    }
  });
};

module.exports = {
  DEFAULT_ENTRY_POINT: DEFAULT_ENTRY_POINT,
  DEFAULT_PROJECT_NAME: DEFAULT_PROJECT_NAME,
  Builder: Builder
};
