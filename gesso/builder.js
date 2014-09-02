var fs = require('fs');
var path = require('path');
var webmake = require('webmake');


var PACKAGE_FILE = 'package.json';
var DEFAULT_ENTRY_POINT = 'index.js';


function _BuildRef() {
}


function resolveEntryPoint(fileOrPath) {
  if (!fileOrPath || fileOrPath === DEFAULT_ENTRY_POINT) {
    return DEFAULT_ENTRY_POINT;
  }

  // Try reading entry point from package
  var stats = fs.lstatSync(fileOrPath);
  if (stats.isDirectory()) {
    var pkg = require(path.join(fileOrPath, PACKAGE_FILE));
    return pkg.main || DEFAULT_ENTRY_POINT;
  }

  return path;
}


function Builder(entryPoint) {
  this.entryPoint = resolveEntryPoint(entryPoint);
  this._readyQueue = [];
  this._latestBuild = null;
  this._lastOutput = null;
  this._lastError = null;
}
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

  // Call all whenReady callbacks
  for (var index = 0; index < readyQueue.length; index++) {
    var callback = readyQueue[index];
    try {
      callback(err, output);
    } catch(ex) {
      console.log('Error in whenReady callback: ' + ex);
    }
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
    // Handle post-build only if this is the latest build
    if (currentBuild === self._latestBuild) {
      self._postbuild(err, output, callback);
    }

    // Always call callback of current build
    if (typeof callback === 'function') {
      callback(err, output);
    }
  });
};


module.exports = {
  DEFAULT_ENTRY_POINT: DEFAULT_ENTRY_POINT,
  Builder: Builder,
  resolveEntryPoint: resolveEntryPoint
};
