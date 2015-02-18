Hello - Gesso Example
=====================

An example project for code seen in the [the Gesso README][].


Installation
------------

Make sure Gesso is installed

```bash
$ npm install -g gesso
```

Install dependencies

```bash
$ npm install
```


Usage
-----

```bash
$ gesso serve
```

Visit [http://localhost:63550](http://localhost:63550/).


Contents
--------

```js
// Get the canvas context
var gesso = require('gesso');
var ctx = gesso.getContext2D();

// Draw two lines of text
ctx.font = '36px Verdana';
ctx.fillStyle = '#f34';
ctx.fillText('Hello,', 123, 100);
ctx.shadowColor = '#f0f';
ctx.shadowBlur = 8;
ctx.fillText('Browser Games!', 26, 150);
```


Screenshot
----------

![Screenshot](screenshot.png)


[the Gesso README]: ../../README.md
