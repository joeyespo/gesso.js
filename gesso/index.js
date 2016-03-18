var command = module.require('./command');

module.exports = {
  globalMain: command.globalMain,
  packagelessMain: command.packagelessMain,
  main: command.main
};
