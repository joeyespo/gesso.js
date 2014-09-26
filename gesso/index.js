// Re-using Gesso entry point
// Detect whether this is called from a built bundle from the browser, or as the build project.


if (typeof window !== 'undefined') {
  // Client-side require
  module.exports = {
    canvas: document.getElementById('gesso-target')
  };
} else {
  // Server-side require -- use module.require so the build doesn't detect this
  var command = module.require('./command');
  module.exports = {
    globalMain: command.globalMain,
    packagelessMain: command.packagelessMain,
    main: command.main
  };
}
