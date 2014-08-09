Gesso.js
========

Gesso lets you create [HTML &lt;canvas&gt;][] games and applications for the browser,
using the powerful server-side constructs you're used to such as [npm packages][npm]
and [node modules][], without any HTML/CSS boilerplate.

More specifically, Gesso is a command-line tool that:

- Watches a directory tree, **collecting** assets and **compiling** your source on-the-fly
- Serves a website on `localhost` containing a canvas to see your progress **without boilerplate**
- Lets you **publish a single JavaScript file** to any page containing `<canvas id="your-project-name">`

Gesso includes a minimal base library for accessing and working with your canvas,
and a sophisticated plugin system to handle more ambitious canvas projects.


Motivation
----------

Sometimes you just want to [make good art][] in the browser. This project lets
you dive right in, because inspiration shouldn't be wasted on the boilerplate.


Installation
------------

Install with [npm][]:

```bash
$ npm install -g gesso
```


Usage
-----

Start watching a project by running

```bash
$ cd myproject
$ gesso
 * Running on http://localhost:8080/
```

Now open a browser and visit http://localhost:8080

If gesso finds a `index.js` or a `package.json` containing a [main][], it
will build it and begin watching for changes. If an entry point cannot be
found, you'll see these instructions in the browser.


Examples
--------

#### Low-level access to the Canvas element

```js
var canvas = require('canvas');
var ctx = canvas.getContext('2d');

ctx.fillText("Hello world!", 10, 10);
```


[HTML &lt;canvas&gt;]: http://en.wikipedia.org/wiki/Canvas_element
[npm]: http://npmjs.org
[node modules]: http://nodejs.org/api/modules.html
[make good art]: http://www.youtube.com/watch?v=ikAb-NYkseI
[main]: http://npmjs.org/api/package.json
