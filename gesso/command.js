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
  '    --host=<host>       (Default: localhost)',
  '    --log-all           Logs all HTTP requests',
  '',
  '  gesso build [options]',
  '    Builds your app, copies the files in assets/, and bundles them  a default index.html',
  '    to output directory (dist/ by default).',
  '    Aliases: b',
  '    --out=<path>, -o    (Default: dist/gesso-bundle.js)',
  '    --no-index          Does not create dist/index.html'
].join('\n');


function exitWithHelp(showVersion, localVersion) {
  if (showVersion) {
    if (localVersion) {
      console.log('version: ' + localVersion);
      console.log('global: ' + pkg.version);
    } else {
      console.log('version: ' + pkg.version);
    }
    console.log('node: ' + process.version);
  } else {
    console.log(doc);
  }
  process.exit(0);
}


function processArguments(argv, localVersion) {
  var args = {help: false};
  if (typeof argv !== 'undefined') {
    args.argv = argv;
  }

  var options = docopt.docopt(doc, args);
  if (options['-h'] || options['--help']) {
    exitWithHelp();
  }
  if (options['-v'] || options['--version']) {
    exitWithHelp(true, localVersion);
  }
  return options;
}


function main(argv, modulePackage) {
  var options = processArguments(argv, modulePackage.version);
  var command = options['<command>'];

  // Always show local version
  console.log('version: ' + modulePackage.version);

  switch(command) {
  case 'build':
  case 'b':
    bundler.bundle({
      outputFile: options['--out'],
      noIndex: options['--no-index']
    }, function (err) {
      process.exit(err ? 1 : 0);
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
  var options = processArguments(argv, null);
  var command = options['<command>'];

  // Always show global version
  console.log('version: ' + pkg.version);

  switch(command) {
  case 'build':
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
  console.error(chalk.red('No local installation of gesso found at'), chalk.magenta(tildify(process.cwd())));
  console.error(chalk.red('Try running: npm install gesso'));
  process.exit(1);
}


function globalMain(argv) {
  new Liftoff({
    name: 'gesso'
  }).launch({}, function(env) {
    // Check for local installation and run it's main function,
    // or run packageless main if outside of a package
    if (env.modulePath) {
      require(env.modulePath).main(argv, env.modulePackage);
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
