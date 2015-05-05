Gesso Changelog
===============


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
