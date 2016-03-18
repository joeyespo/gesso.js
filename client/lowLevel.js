/* globals document */

var raf = require('./vendor/raf');
var util = require('./util');

// Global polyfills
require('./vendor/hand.min.1.3.8');

// TODO: Find a better way to do this
var getScriptUrl = (function () {
  var scripts = document.getElementsByTagName('script');
  var index = scripts.length - 1;
  var thisScript = scripts[index];
  return function () { return thisScript.src; };
})();

function getQueryVariables() {
  var pl = /\+/g;  // Regex for replacing addition symbol with a space
  var search = /([^&=]+)=?([^&]*)/g;
  var decode = function (s) {
    return decodeURIComponent(s.replace(pl, ' '));
  };
  var query = window.location.search.substring(1);

  var urlParams = {};
  while (true) {
    var match = search.exec(query);
    if (!match) {
      return urlParams;
    }
    urlParams[decode(match[1])] = decode(match[2]);
  }
}

function getRootElement() {
  return document;
}

function isRootContainer(target) {
  return target === document || target === document.body;
}

function getCanvas() {
  // TODO: Extract this out to break dependency
  if (typeof window === 'undefined') {
    throw new Error('Cannot get canvas outside of browser context.');
  }

  // TODO: Read the project settings use the right ID
  var canvas = window.document.getElementById('gesso-target');

  // Replace image placeholder with canvas
  if (canvas && canvas.tagName === 'IMG') {
    canvas = util.changeTagName(canvas, 'canvas');
  }

  // Default to using the only canvas on the page, if available
  if (!canvas) {
    var canvases = window.document.getElementsByTagName('canvas');
    if (canvases.length === 1) {
      canvas = canvases[0];
    }
  }

  // Raise error if no usable canvases were found
  if (!canvas) {
    throw new Error('Canvas not found.');
  }

  return canvas;
}

function getContext2D() {
  return getCanvas().getContext('2d');
}

function getWebGLContext() {
  return getCanvas().getContext('webgl');
}

module.exports = {
  requestAnimationFrame: raf.requestAnimationFrame,
  cancelAnimationFrame: raf.cancelAnimationFrame,
  getScriptUrl: getScriptUrl,
  getQueryVariables: getQueryVariables,
  getRootElement: getRootElement,
  isRootContainer: isRootContainer,
  getCanvas: getCanvas,
  getContext2D: getContext2D,
  getWebGLContext: getWebGLContext
};
