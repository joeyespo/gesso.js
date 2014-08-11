#!/usr/bin/env node

var path = require('path');
var chalk = require('chalk');
var tildify = require('tildify');
var minimist = require('minimist');
var Liftoff = require('liftoff');


var cli = new Liftoff({
  name: 'gesso'
});


// Wire up a few err listeners to liftoff
cli.on('require', function(name) {
  console.log('Requiring external module', chalk.magenta(name));
});

cli.on('requireFail', function(name) {
  console.log(chalk.red('Failed to load external module'), chalk.magenta(name));
});


// Parse arguments
var argv = minimist(process.argv.slice(2));
var cliPackage = require('../package');
var helpFlag = argv.help || argv.h;
var versionFlag = argv.version || argv.v;
var tasks = argv._;
var task = tasks.length ? tasks : ['run'];


// Lunch local variant
cli.launch({
  cwd: argv.cwd,
  require: argv.require,
  completion: argv.completion
}, function(env) {
  var localInstallation = !!env.modulePath;

  if (helpFlag) {
    // TODO: Show help
    console.log('Gesso help');
    process.exit(0);
  }

  if (versionFlag) {
    console.log('version:', localInstallation ? env.modulePackage.version : cliPackage.version);
    console.log('node:', process.versions.node);
    process.exit(0);
  }

 if (!localInstallation) {
    console.log(chalk.red('No local installation of gesso found at'), chalk.magenta(tildify(env.cwd)));
    console.log(chalk.red('Try running: npm install gesso'));
    process.exit(1);
  }

  // Run local installation
  require(env.modulePath).run();
});
