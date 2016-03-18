Gesso Changelog
===============


Version 0.13.0 (2016-03-18)
---------------------------

- Enhancement: Expose URL parameters with `Gesso.param('<name>')`
- Enhancement: Add viewport to server's client for mobile testing
- Enhancement: Add `max-width: 100%` to canvas for resize testing
- Enhancement: Add `pointerdown`, `pointermove`, and `pointerup` for unifying mouse and touch events (use hand.js polyfill for cross-browser support)
- Enhancement: Add `keydown` and `keyup` for basic keyboard input
- Enhancement: Send CLI errors to `stderr` instead of `stdout`
- Bugfix: Move `Gesso.asset` method to protocol
- Bugfix: Prevent keyboard default only when no other DOM element is focused
- Bugfix: Explicitly check for `window` global in RAF
- Bugfix: Remove unused `bower` dependency from `package.json`
- Cleanup: Move remaining vendor file, `raf.js`, to vendor subdirectory
- Cleanup: Use JavaScript convention of only one newline between top-level functions
- License: Update license to 2016


Version 0.12.0 (2015-09-12)
---------------------------

- Enhancement: Have `Gesso` handle `preventDefault` for the click event
- Enhancement: Remove Bootstrap, FontAwesome, and jQuery dependencies
- Enhancement: Remove Bower dependency from the built-in server's frontend
  (removed Bootstrap, FontAwesome, and jQuery; added custom Bootstrap-based CSS reset;
  inlined source-map-support, and stacktrace.js)
- Enhancement: Build and serve `<project-name>.js` instead of `gesso-bundle.js`
- Enhancement: Allow passing in custom `argv` to `globalMain` for running the CLI from a script
- Enhancement: Build and serve client assets from `/assets` and add `Gesso.asset('<filename>')`
  helper for constructing proper asset URLs (e.g. serving from a CDN)
- Bugfix: Handle malformed logging message errors on the server
- Bugfix: Don't syntax-check .json files that are loaded with `require` in client code
- Bugfix: Serve title and script name dynamically so you don't need to re-run the server manually
- Docs: Update and clean up the examples


Version 0.11.0 (2015-05-08)
---------------------------

- API: Expose Controller.canvas.
- Enhancement: Add ability to listen to Delegate subscribes and unsubscribes.
- Enhancement: Add cross-platform Gesso.click() handler for mousedown and touchstart.
- Enhancement: Add ability to use <img id="gesso-target"> as a placeholder until script loads.
- Bugfix: Reflect default host in CLI usage help.
- Bugfix: Fix endless wait after building from the CLI.


Version 0.10.1 (2015-05-04)
---------------------------

- Bugfix: Fix Gesso.height


Version 0.10.0 (2015-02-24)
---------------------------

- Enhancement: Allow inspection of Delegate's handlers and clean up
- Enhancement: Always show the version when running Gesso, and show the locally installed version on `-v`
- Enhancement: Switch to Browserify to allow requiring of built-in Node.js modules
- Enhancement: Show Node.js-like errors in the browser, including the original stack trace and the source line
- Bugfix: Use `gesso build` like the usage shows, instead of accepting the old `gesso bundle`
- Bugfix: Add missing `bower` dependency to `package.json`
- Readme: Separate out `npm install -S gesso` step
- Readme: Update example code and `hello` project


Version 0.9.0 (2015-02-18)
--------------------------

- Breaking Change: Rename `gesso bundle` to `gesso build`
- Breaking Change: API changes
- Enhancement: Hide auxiliary HTTP requests and add --log-all for showing them again
- Enhancement: Add -o alias to bundle command
- Enhancement: Bundle an index.html to play without programming and add --no-index to bundle without it
- Enhancement: Add project name to the page title
- Enhancement: Show build errors in magenta
- Enhancement: Show errors from the client (in red)
- Enhancement: Add Gesso class with update and render delegates, hooks for plugins, and logging to the server
- License: Update license to 2015 and switch to MIT


Version 0.8.5 (2014-10-21)
--------------------------

Testing: Test the build system.


Version 0.8.4 (2014-10-21)
--------------------------

Bugfix: Fix jQuery link.


Version 0.8.1 (2014-10-21)
--------------------------

Bugfix: Add `bower install` to build.


Version 0.8.0 (2014-10-20)
--------------------------

First public preview release.
