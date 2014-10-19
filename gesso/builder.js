var fs = require('fs');
var path = require('path');
var esprima = require('esprima');
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
Builder.prototype._formatBuildError = function(err) {
  // Format IO error
  if (err.errno) {
    switch(err.errno) {
    case 28:
      return new Error('IOError: Entry point must be a file, not a directory: ' + this.entryPoint);
    case 34:
      return new Error('Entry point not found: ' + this.entryPoint);
    default:
      return new Error('IOError: ' + (err.message || String(err)) + ' (errno: ' + err.errno + ')');
    }
  }

  // Format webmake error
  if (err.code) {
    switch(err.code) {
    case 'AST_ERROR':
      var filename = err.message;
      var lineNumber = 0;

      var lineIndex = filename.indexOf(':');
      if (lineIndex !== -1) {
        var lineNumberIndex = filename.lastIndexOf(' ', lineIndex);
        if (lineNumberIndex !== -1) {
          lineNumber = filename.substring(lineNumberIndex + 1, lineIndex);
        }
        filename = filename.substr(lineIndex + 1).trim();
      }
      if (err.origin.description) {
        var errorIndex = filename.indexOf(err.origin.description);
        if (errorIndex !== -1) {
          filename = filename.substr(errorIndex + err.origin.description.length).trim();
        }
      }
      var inIndex = filename.indexOf('in');
      if (inIndex !== -1) {
        filename = filename.substr(inIndex + 2).trim();
      }
      return new Error([
        filename + ':' + lineNumber,
        '',
        'WebmakeError: ' + err.origin.description || err.message,
      ].join('\n'));

    default:    // 'DYNAMIC_REQUIRE', 'INVALID_TRANSFORM', 'EXTENSION_NOT_INSTALLED'
      return err;
    }
  }
};
// HACK: Adjust for line number until files can be checked individually
Builder.prototype._translateSyntaxErrorFix = function(error, output) {
  var filename = '(unknown)';
  var lineNumber = '(unknown)';
  var indentOffset = 0;

  // Use basic string matching to get the base of the filename (good enough),
  // estimated line number, and indent. This give *some* context until the HACK
  // in build is fixed.
  var header = '": function (exports, module, require) {';
  var headerIndex = output.lastIndexOf(header, error.index);
  if (headerIndex !== -1) {
    var lines = header.substring(headerIndex, error.index);
    lineNumber = (lines.match(/\n/g) || []).length;

    var headerLineIndex = output.lastIndexOf('\n', headerIndex);
    if (headerLineIndex !== -1) {
      var nameIndex = output.indexOf('"', headerLineIndex);
      if (nameIndex !== -1) {
        // Mote: webmake template uses tabs
        indentOffset = nameIndex - headerLineIndex + 1;
        filename = output.substring(nameIndex + 1, headerIndex);
      }
    }
  }

  // Get line
  var lineStartIndex = output.lastIndexOf('\n', error.index);
  if (lineStartIndex === -1) {
    lineStartIndex = 0;
  }
  var lineEndIndex = output.indexOf('\n', error.index);
  if (lineEndIndex === -1) {
    lineEndIndex = output.length - 1;
  }
  var line = output.substring(lineStartIndex + indentOffset, lineEndIndex);

  var marker = '';
  for (; marker.length < error.column - indentOffset;) {
    marker += ' ';
  }
  marker += '^';

  return new Error([
    filename + ':' + lineNumber,
    line,
    marker,
    'SyntaxError: ' + error.description,
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

  var currentBuild = self._prebuild();
  webmake(self.entryPoint, {sourceMap: true, cache: true}, function(err, output) {
    // TODO: Validate each file individually to get proper line numbers
    // HACK: Workaround to report syntax errors before reaching the eval
    // expression in the browser, which blows up without any helpful context.
    // This still doesn't give correct line numbers, but does report it early
    // Waiting on http://github.com/medikoo/modules-webmake/issues/47
    webmake(self.entryPoint, {cache: false}, function(err, rawOutput) {
      // Make build errors human-readable
      if (err) {
        err = self._formatBuildError(err);
      }

      // Validate JavaScript
      if (!err) {
        try {
          var syntax = esprima.parse(rawOutput, {tolerant: true});
          if (syntax.errors.length !== 0) {
            err = new Error(syntax.errors.map(function(err) {
              return self._translateSyntaxErrorFix(err, rawOutput).message;
            }).join('\n'));
          }
        } catch (e) {
          err = self._translateSyntaxErrorFix(e, rawOutput);
        }
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
  });
};


module.exports = {
  DEFAULT_ENTRY_POINT: DEFAULT_ENTRY_POINT,
  Builder: Builder
};
