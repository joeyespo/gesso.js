var fs = require('fs');
var path = require('path');
var webmake = require('webmake');


var PACKAGE_FILE = 'package.json';
var DEFAULT_ENTRY_POINT = 'index.js';


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
      var pkg = require(packagePath);
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

  entryPoint = path.resolve(entryPoint);
  if (projectName === null) {
    projectName = path.basename(entryPoint);
    var extname = path.extname(projectName);
    projectName = projectName.slice(0, projectName.length - extname.length);
  }
  this.projectName = projectName;
  this.entryPoint = entryPoint;
  this.path = path.dirname(entryPoint);
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
Builder.prototype._translateError = function(err) {
  switch(err.errno) {
  case 28:
    return new Error('Entry point must be a file, not a directory: ' + this.entryPoint);
  case 34:
    return new Error('Entry point not found: ' + this.entryPoint);
  default:
    return new Error('Could not run build: ' + String(err) + ' (errno: ' + err.errno + ')');
  }
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

  var currentBuild = self._prebuild();
  webmake(self.entryPoint, function(err, output) {
    if (err && err.errno) {
      err = self._translateError(err);
    }

    // Handle post-build only if this is the latest build
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
  Builder: Builder
};
