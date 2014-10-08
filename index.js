// Gesso Entry Point
// Detect whether this is called from a built bundle from the browser, or as the build project.


if (typeof window === 'undefined') {
  // Use module.require so the client-side build skips over server code,
  // which will work properly at runtime since no window global is defined
  module.exports = module.require('./gesso');
} else {
  // Include in client-side build,
  // which will have a window global defined at runtime
  module.exports = require('./client');
}
