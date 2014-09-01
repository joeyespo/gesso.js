var fs = require('fs');
var path = require('path');
var chokidar = require('chokidar');
var webmake = require('webmake');


function _buildWithLookup(packagePath, build, callback) {
  var pkg = path.join(packagePath, 'package.json');

  fs.readFile(pkg, 'utf8', function(err, data) {
    if (err) {
      callback(err, null);
      return;
    }

    var entryPoint = null;
    try {
      var pkg = JSON.parse(data);
      if (pkg.main) {
        entryPoint = pkg.main;
      }
    }
    catch(ex) {
      callback(ex, null);
      return;
    }

    build(packagePath, entryPoint, callback);
  });
}


function build(packagePath, entryPoint, callback, silent) {
  if (typeof callback === 'undefined') {
    if (typeof entryPoint === 'function') {
      var tmp = entryPoint;
      entryPoint = callback;
      callback = tmp;
    }
  }
  if (typeof entryPoint === 'undefined') {
    return _buildWithLookup(packagePath, build, callback);
  }

  entryPoint = path.join(packagePath, entryPoint);

  webmake(entryPoint, function(err, content) {
    if (err) {
      if (!silent) {
        console.error(String(err));
      }
      if (typeof callback === 'function') {
        callback(err, null);
      }
      return;
    }

    if (typeof callback === 'function') {
      callback(null, content);
    }
  });
}


function _Watcher(packagePath) {
  this._buildError = null;
  this._buildContent = null;
  this._innerWatcher = null;
  this._isRebuilding = false;
  this.whenReadyHandlers = [];
  this.packagePath = packagePath;
}
_Watcher.prototype._beforeRebuild = function() {
  this._isRebuilding = true;
};
_Watcher.prototype._afterRebuild = function(err, content, callback) {
  var readyHandlers = this.whenReadyHandlers;
  this.whenReadyHandlers = [];
  this._isRebuilding = false;

  // Call all whenReady callbacks
  var len = readyHandlers.length;
  for (var index = 0; index < len; index++) {
    var readyHandler = readyHandlers[index];
    try {
      readyHandler();
    } catch(ex) {
      console.log('Error in whenReady callback: ' + ex);
    }
  }

  // Call rebuild callback, if provided
  if (typeof callback === 'function') {
    callback(err, content);
  }
};
_Watcher.prototype.watch = function() {
  var self = this;

  var fsWatcher = chokidar.watch(self.packagePath, {
    ignoreInitial: true,
    ignored: function(filename) {
      var basename = path.basename(filename);
      if (!basename) {
        return false;
      }

      if (basename[0] === '.') {
        return true;
      }

      var selfPath = path.join('node_modules', 'gesso');
      var index = filename.lastIndexOf(selfPath);
      if (index !== -1 && filename.substr(index) === selfPath) {
        return true;
      }

      // TODO: custom filters

      return false;
    }
  });

  var rebuild = function() {
    self.rebuild(function(err, content) {
      self._buildError = err;
      if (!err) {
        self._buildContent = content;
      }
      console.log(' * Watching for changes');
    });
  };

  // Watch for changes
  fsWatcher.on('change', function(filename) {
    console.log(' * Detected change in ' + path.relative(self.packagePath, filename) + ', rebuilding...');
    rebuild();
  });
  self._innerWatcher = fsWatcher;

  // Run first build
  rebuild();
};
_Watcher.prototype.isRebuilding = function() {
  return this._isRebuilding;
};
_Watcher.prototype.whenReady = function(callback) {
  if (this._isRebuilding) {
    this.whenReadyHandlers.push(callback);
  } else {
    callback();
  }
};
_Watcher.prototype.whenBuilt = function(callback) {
  var self = this;

  self.whenReady(function() {
    callback(self._buildError, self._buildContent);
  });
};
_Watcher.prototype.rebuild = function(callback) {
  var self = this;

  self._beforeRebuild();
  try {
    build(self.packagePath, function(err, content) {
      self._afterRebuild(err, content, callback);
    });
  } catch(ex) {
    self._afterRebuild(ex, null, callback);
  }
};


function watch(packagePath) {
  var watcher = new _Watcher(packagePath);
  watcher.rebuild();
  return watcher;
}


module.exports = {
  build: build,
  watch: watch
};
