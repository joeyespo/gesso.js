var path = require('path');
var chokidar = require('chokidar');


function _Watcher(packagePath) {
  var self = this;

  var options = {
    ignoreInitial: true,
    ignored: function(filename) {
      var basename = path.basename(filename);
      if (!basename) {
        return false;
      }

      if (basename[0] === '.') {
        return true;
      }

      selfPath = path.join('node_modules', 'gesso');
      var index = filename.lastIndexOf(selfPath);
      if (index !== -1 && filename.substr(index) === selfPath) {
        return true;
      }

      // TODO: custom filters

      return false;
    }
  };

  var fsWatcher = chokidar.watch(packagePath, options);
  fsWatcher.on('change', function(filename) {
    console.log(' * Detected change in ' + path.relative(packagePath, filename));
    self.rebuild(this);
  });


  this._innerWatcher = fsWatcher;
  this._isRebuilding = false;
  this._afterRebuild = [];
  this.packagePath = packagePath;
}
_Watcher.prototype.isRebuilding = function(callback) {
  return this._isRebuilding;
};
_Watcher.prototype.whenReady = function(callback) {
  if (this._isRebuilding) {
    this._afterRebuild.push(callback);
  } else {
    callback();
  }
};
_Watcher.prototype.rebuild = function() {
  this._isRebuilding = true;
  try {
    build(this.packagePath);
  } finally {
    this._isRebuilding = false;
  }
};


function build(packagePath) {
  // TODO: implement
}


function watch(packagePath) {
  return new _Watcher(packagePath);
}


module.exports = {
  build: build,
  watch: watch
};
