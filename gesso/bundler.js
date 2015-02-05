var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var nunjucks = require('nunjucks');
var builder = require('./builder');
var settings = require('./settings');
var Builder = builder.Builder;


var DEFAULT_BUNDLE_FILE = path.join('dist', 'gesso-bundle.js');


function _callback(callback, err) {
  return (typeof callback === 'function') ? callback(err) : null;
}


function _error(callback, err, header) {
  if (err) {
    console.log(chalk.red((header ? header + ': ' : '') + (err.message || String(err))));
  }
  return _callback(callback, err);
}


function mkdirs(dir, callback) {
  // Get list of directories to make, keeping track of the current directory
  var dirnames = [];
  var currentPath = '.';
  for(var pathname = path.relative('.', dir); pathname !== '.'; pathname = path.dirname(pathname)) {
    // Add directory, or track if '..'
    var basename = path.basename(pathname);
    if (basename && basename !== '.' && basename !== '..') {
      dirnames.unshift(basename);
    } else if (basename === '..') {
      currentPath = path.join(currentPath, '..');
    }
  }

  // Run async mkdir recursively
  function mkdirsInner(dirnames, currentPath, callback) {
    // Check for completion and call callback
    if (dirnames.length === 0) {
      return _callback(callback);
    }

    // Make next directory
    var dirname = dirnames.shift();
    currentPath = path.join(currentPath, dirname);
    fs.exists(currentPath, function(err, exists) {
      fs.mkdir(currentPath, function(err) {
        return mkdirsInner(dirnames, currentPath, callback);
      });
    });
  }
  return mkdirsInner(dirnames, currentPath, callback);
}


function bundle(options, callback) {
  options = options || {};

  // Create builder and run build
  var builder = new Builder(options.packagePath);
  var outputFile = options.outputFile || path.join(builder.path, DEFAULT_BUNDLE_FILE);

  // Configure extensions
  nunjucks.configure(path.join(__dirname, 'views'));

  // Run the build
  console.log('Building', path.relative('.', outputFile) + '...');
  builder.build(function(err, output) {
    if (err) {
      return _error(callback, err);
    }

    var outputDir = path.dirname(outputFile);
    mkdirs(outputDir, function(err) {
      if (err) {
        return _error(callback, err, 'Could not create output directory');
      }

      fs.writeFile(outputFile, output, function(err) {
        if (err) {
          return _error(callback, err, 'Could not write output file');
        }

        if (options.noIndex) {
          return _callback(callback);
        }

        var index = nunjucks.render('dist/index.html', {
          gessoScript: path.basename(outputFile),
          gessoProjectName: builder.projectName,
          canvasId: settings.CANVAS_ID,
          canvasWidth: settings.CANVAS_WIDTH,
          canvasHeight: settings.CANVAS_HEIGHT
        });
        fs.writeFile(path.join(outputDir, 'index.html'), index, function(err) {
          if (err) {
            return _error(callback, err, 'Could not write index file');
          }

          return _callback(callback);
        });
      });
    });
  });
}


module.exports = {
  bundle: bundle
};
