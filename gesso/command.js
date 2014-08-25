var multiline = require('multiline');
var docopt = require('docopt');
var Liftoff = require('liftoff');
var tildify = require('tildify');
var chalk = require('chalk');
var server = require('./server');
var pkg = require('../package');
// Unpack
var docopt = docopt.docopt;
var version = 'Gesso ' + pkg.version;


// CLI documentation and options
var doc = multiline(function(){/*
Usage:
  gesso [options] [<path>]

Options:
  -h --help         Show this screen.
  --version         Show version.
*/});


function globalMain() {
  new Liftoff({
    name: 'gesso'
  }).launch({}, function(env) {
    // Check for local installation
    if (!env.modulePath) {
      // TODO: Check for package.json and either warn that there's no project or show help instead

      // Show --help or --version and exit
      docopt(doc, {version: version});
      // Show local installation message and exit
      console.log(chalk.red('No local installation of gesso found at'), chalk.magenta(tildify(env.cwd)));
      console.log(chalk.red('Try running: npm install gesso'));
      process.exit(1);
    }

    // Run local installation
    require(env.modulePath).main();
  });
}


function main(argv) {
  var options = docopt(doc, {argv: argv, version: version});

  // TODO: Build command

  // Run server
  server.serve(options['<path>']);
}


module.exports = {
  globalMain: globalMain,
  main: main
};
