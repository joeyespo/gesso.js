var url = require('url');
var path = require('path');
var Controller = require('./controller');
var Delegate = require('./delegate');
var lowLevel = require('./lowLevel');
var logging = require('./logging');

function pointerHandlerWrapper(gesso, canvas, handler) {
  return function (e) {
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    if (gesso.width !== rect.width) {
      x *= gesso.width / rect.width;
    }
    if (gesso.height !== rect.height) {
      y *= gesso.height / rect.height;
    }
    handler({x: x, y: y, e: e});
    return false;
  };
}

function keyHandlerWrapper(handler) {
  return function (e) {
    var handled = handler({which: e.which, e: e});
    // Prevent default when handled and not focused on an external UI element
    if (handled && lowLevel.isRootContainer(e.target)) {
      e.preventDefault();
      return false;
    }
  };
}

function Gesso(options) {
  options = options || {};
  this.queryVariables = null;
  this.scriptUrl = Gesso.getScriptUrl();
  this.contextType = options.contextType || '2d';
  this.contextAttributes = options.contextAttributes;
  this.fps = options.fps || 60;
  this.autoplay = options.autoplay || true;
  this.width = options.width || 640;    // TODO: allow 'null' to use width of target canvas
  this.height = options.height || 480;  // TODO: allow 'null' to use height of target canvas
  this.setup = new Delegate();
  this.start = new Delegate();
  this.stop = new Delegate();
  this.update = new Delegate();
  this.render = new Delegate();
  // TODO: Use the canvas passed into run() instead of Gesso.getCanvas in these input handlers
  var self = this;
  this.click = new Delegate(function (handler) {
    var canvas = Gesso.getCanvas();
    var r = {canvas: canvas, handlerWrapper: pointerHandlerWrapper(self, canvas, handler)};
    r.canvas.addEventListener('touchstart', r.handlerWrapper, false);
    r.canvas.addEventListener('mousedown', r.handlerWrapper, false);
    return r;
  }, function (handler, r) {
    r.canvas.removeEventListener('touchstart', r.handlerWrapper || handler);
    r.canvas.removeEventListener('mousedown', r.handlerWrapper || handler);
  });
  this.pointerdown = new Delegate(function (handler) {
    var canvas = Gesso.getCanvas();
    var r = {canvas: canvas, handlerWrapper: pointerHandlerWrapper(self, canvas, handler)};
    r.canvas.addEventListener('pointerdown', r.handlerWrapper, false);
    return r;
  }, function (handler, r) {
    r.canvas.removeEventListener('pointerdown', r.handlerWrapper || handler);
  });
  this.pointermove = new Delegate(function (handler) {
    var canvas = Gesso.getCanvas();
    var r = {canvas: canvas, handlerWrapper: pointerHandlerWrapper(self, canvas, handler)};
    r.canvas.addEventListener('pointermove', r.handlerWrapper, false);
    return r;
  }, function (handler, r) {
    r.canvas.removeEventListener('pointermove', r.handlerWrapper || handler);
  });
  this.pointerup = new Delegate(function (handler) {
    var canvas = Gesso.getCanvas();
    var r = {canvas: canvas, handlerWrapper: pointerHandlerWrapper(self, canvas, handler)};
    r.canvas.addEventListener('pointerup', r.handlerWrapper, false);
    return r;
  }, function (handler, r) {
    r.canvas.removeEventListener('pointerup', r.handlerWrapper || handler);
  });
  this.keydown = new Delegate(function (handler) {
    var r = {root: lowLevel.getRootElement(), handlerWrapper: keyHandlerWrapper(handler)};
    r.root.addEventListener('keydown', r.handlerWrapper, false);
    return r;
  }, function (handler, r) {
    r.root.removeEventListener('keydown', r.handlerWrapper || handler);
  });
  this.keyup = new Delegate(function (handler) {
    var r = {root: lowLevel.getRootElement(), handlerWrapper: keyHandlerWrapper(handler)};
    r.root.addEventListener('keyup', r.handlerWrapper, false);
    return r;
  }, function (handler, r) {
    r.root.removeEventListener('keyup', r.handlerWrapper || handler);
  });
  this._initialized = false;
  this._frameCount = 0;
}
Gesso.Controller = Controller;
Gesso.Delegate = Delegate;
Gesso.getQueryVariables = lowLevel.getQueryVariables;
Gesso.getScriptUrl = lowLevel.getScriptUrl;
Gesso.requestAnimationFrame = lowLevel.requestAnimationFrame;
Gesso.cancelAnimationFrame = lowLevel.cancelAnimationFrame;
Gesso.getCanvas = lowLevel.getCanvas;
Gesso.getContext2D = lowLevel.getContext2D;
Gesso.getWebGLContext = lowLevel.getWebGLContext;
Gesso.error = logging.error;
Gesso.info = logging.info;
Gesso.log = logging.log;
Gesso.warn = logging.warn;
Gesso.prototype.initialize = function initialize() {
  if (this._initialized) {
    return;
  }
  this._initialized = true;
  this.setup.invoke();
};
Gesso.prototype.step = function step(context) {
  this.nextFrame();
  this.renderTo(context);
};
Gesso.prototype.nextFrame = function nextFrame() {
  return this.update.invoke(++this._frameCount);
};
Gesso.prototype.renderTo = function renderTo(context) {
  return this.render.invoke(context);
};
Gesso.prototype.run = function run(canvas) {
  var controller = new Controller(this, canvas);
  controller.start();
  return controller;
};
Gesso.prototype.asset = function asset(assetPath) {
  return url.resolve(this.scriptUrl, path.join('assets', assetPath));
};
Gesso.prototype.param = function param(name) {
  if (this.queryVariables === null) {
    this.queryVariables = Gesso.getQueryVariables();
  }
  return this.queryVariables[name];
};

module.exports = Gesso;
