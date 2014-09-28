var fs = require('fs');
var path = require('path');
var webmake = require('webmake');


var PACKAGE_FILE = 'package.json';
var DEFAULT_ENTRY_POINT = 'index.js';


function _BuildRef() {
}


function resolveEntryPoint(fileOrPath) {
  if (typeof fileOrPath === 'undefined') {
    fileOrPath = '.';
  }

  // Try reading entry point from package
  if (fileOrPath === '.' || fs.lstatSync(fileOrPath).isDirectory()) {
    var entryPoint = null;
    try {
      entryPoint = require(path.resolve(path.join(fileOrPath, PACKAGE_FILE))).main;
    } catch(ex) {
    }
    if (!entryPoint) {
      entryPoint = path.join(fileOrPath, DEFAULT_ENTRY_POINT);
    }
    return path.resolve(entryPoint);
  }

  return path.resolve(fileOrPath);
}


function Builder(entryPoint) {
  entryPoint = resolveEntryPoint(entryPoint);
  this.entryPoint = entryPoint;
  this.path = path.dirname(entryPoint);
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
