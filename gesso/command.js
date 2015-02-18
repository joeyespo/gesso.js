var docopt = require('docopt');
var Liftoff = require('liftoff');
var tildify = require('tildify');
var chalk = require('chalk');
var bundler  = require('./bundler');
var server = require('./server');
var pkg = require('../package');


// CLI documentation and options
var doc = [
  'Usage:',
  '  gesso [<command>] [options]',
  '  gesso -v | --version',
  '  gesso -h | --help',
  '',
  'Commands:',
  '  gesso serve [options]',
  '    Builds and serves your app, rebuilding on file changes.',
  '    Aliases: server, s',
  '    --port=<port>, -p   (Default: 63550)',
  '    --host=<host>       (Default: 0.0.0.0)',
  '    --log-all           Logs all HTTP requests',
  '',
  '  gesso bundle [options]',
  '    Builds your app and bundles it into the output file (dist/gesso-bundle.js by default).',
  '    Aliases: b',
  '    --out=<path>, -o    (Default: dist/gesso-bundle.js)',
  '    --no-index          Does not create dist/index.html'
].join('\n');


function exitWithHelp(version) {
  console.log(version ? 'Gesso ' + pkg.version : doc);
  process.exit(0);
}


function processArguments(argv) {
  var args = {help: false};
  if (typeof argv !== 'undefined') {
    args.argv = argv;
  }

  var options = docopt.docopt(doc, args);
  if (options['-h'] || options['--help']) {
    exitWithHelp();
  }
  if (options['-v'] || options['--version']) {
    exitWithHelp(true);
  }
  return options;
}


function main(argv) {
  var options = processArguments(argv);
  var command = options['<command>'];

  switch(command) {
  case 'bundle':
  case 'b':
    bundler.bundle({
      outputFile: options['--out'],
      noIndex: options['--no-index']
    });
    break;

  case 'serve':
  case 'server':
  case 's':
    server.serve({
      host: options['--host'],
      port: options['--port'],
      logAll: options['--log-all']
    });
    break;

  default:
    exitWithHelp();
    break;
  }
}


function packagelessMain(argv) {
  var options = processArguments(argv);
  var command = options['<command>'];

  switch(command) {
  case 'bundle':
  case 'b':
    break;

  case 'serve':
  case 'server':
  case 's':
    break;

  default:
    exitWithHelp();
    break;
  }

  // Show local installation message and exit
  console.log(chalk.red('No local installation of gesso found at'), chalk.magenta(tildify(process.cwd())));
  console.log(chalk.red('Try running: npm install gesso'));
  process.exit(1);
}


function globalMain() {
  new Liftoff({
    name: 'gesso'
  }).launch({}, function(env) {
    // Check for local installation and run it's main function,
    // or run packageless main if outside of a package
    if (env.modulePath) {
      require(env.modulePath).main();
    } else {
      packagelessMain();
    }
  });
}


module.exports = {
  main: main,
  packagelessMain: packagelessMain,
  globalMain: globalMain,
};
