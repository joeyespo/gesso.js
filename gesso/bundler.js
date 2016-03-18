var fs = require('fs-extra');
var path = require('path');
var chalk = require('chalk');
var nunjucks = require('nunjucks');
var builder = require('./builder');
var settings = require('./settings');
var Builder = builder.Builder;

var DEFAULT_OUTPUT_DIRECTORY = 'dist';
var DEFAULT_PROJECT_NAME = builder.DEFAULT_PROJECT_NAME;

function _callback(callback, err) {
  return (typeof callback === 'function') ? callback(err) : null;
}

function _error(callback, err, header) {
  if (err) {
    console.log(chalk.bold.magenta((header ? header + ': ' : '') + (err.message || String(err))));
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
    fs.mkdir(currentPath, function(err) {
      return mkdirsInner(dirnames, currentPath, callback);
    });
  }
  return mkdirsInner(dirnames, currentPath, callback);
}

function bundle(options, callback) {
  options = options || {};

  // Create builder and run build
  var builder = new Builder(options.packagePath);
  var defaultOutputFilename = builder.projectName || DEFAULT_PROJECT_NAME;
  var outputFile = (options.outputFile ||
    path.join(builder.path, DEFAULT_OUTPUT_DIRECTORY, defaultOutputFilename) + '.js');
  var outputDir = path.dirname(outputFile);
  var assetsDir = path.join(builder.path, 'assets');

  // Configure extensions
  nunjucks.configure(path.join(__dirname, 'views'));

  // Run the build
  console.log('Building', path.relative('.', outputFile) + '...');
  builder.build(function(err, output) {
    if (err) {
      return _error(callback, err);
    }

    mkdirs(outputDir, function(err) {
      if (err) {
        return _error(callback, err, 'Could not create output directory');
      }

      fs.writeFile(outputFile, output, function(err) {
        if (err) {
          return _error(callback, err, 'Could not write output file');
        }

        // Add asset directory
        fs.exists(assetsDir, function(exists) {
          function addIndex() {
            // Check for --no-index
            if (options.noIndex) {
              return _callback(callback);
            }

            // Add index.html
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
          }

          if (exists) {
            var outputAssetsDir = path.join(outputDir, 'assets');
            console.log('Copying assets to', path.relative('.', outputAssetsDir) + '...');
            fs.copy(assetsDir, outputAssetsDir, addIndex);
          } else {
            addIndex();
          }
        });
      });
    });
  });
}

module.exports = {
  bundle: bundle
};
