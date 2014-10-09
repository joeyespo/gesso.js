var path = require('path');
var chalk = require('chalk');
var chokidar = require('chokidar');


function Watcher(builder) {
  this.builder = builder;
  this.path = builder.path;
  this.silent = false;
  this._innerWatcher = null;
}
Watcher.prototype._isIgnored = function(filename) {
  // Ignore directories
  var basename = path.basename(filename);
  if (!basename) {
    return false;
  }

  // Ignore dotfiles
  if (basename[0] === '.') {
    return true;
  }

  // Ignore self in case of 'nom link'
  var selfPath = path.join('node_modules', 'gesso');
  var index = filename.lastIndexOf(selfPath);
  if (index !== -1 && filename.substr(index) === selfPath) {
    return true;
  }

  // TODO: custom ignore filters
  return false;
};
Watcher.prototype._watching = function() {
  var self = this;

  // Wait for latest build to finish
  self.builder.ready(function(err, output) {
    if (err) {
      console.log(chalk.red(String(err)));
    }

    if (!self.silent) {
      console.log(' * Watching for changes');
    }
  });
};
Watcher.prototype._changed = function(filename) {
  var self = this;

  if (!self.silent) {
    console.log(' * Detected change in ' + path.relative(self.path, filename) + ', rebuilding...');
  }

  // Rebuild
  var alreadyBuilding = self.builder.isBuilding();
  self.builder.build();
  // Show watching only if this is a new build
  if (!alreadyBuilding) {
    self._watching();
  }
};
Watcher.prototype.innerWatcher = function() {
  return this._innerWatcher;
};
Watcher.prototype.watch = function() {
  var self = this;

  if (self._innerWatcher) {
    throw new Error('Already watching.');
  }

  // Watch for changes
  var fsWatcher = chokidar.watch(self.path, {
    ignoreInitial: true,
    ignored: function(filename) { return self._isIgnored(filename); },
  });
  fsWatcher.on('change', function(filename) {
    self._changed(filename);
  });
  self._innerWatcher = fsWatcher;

  // Show watching for the first time
  self._watching();
};


module.exports = {
  Watcher: Watcher
};
