var Controller = require('./controller');
var Delegate = require('./delegate');
var lowLevel = require('./lowLevel');
var logging = require('./logging');


function Gesso(options) {
  options = options || {};
  this.contextType = options.contextType || '2d';
  this.contextAttributes = options.contextAttributes;
  this.fps = options.fps || 60;
  this.autoplay = options.autoplay || true;
  this.setup = new Delegate();
  this.start = new Delegate();
  this.stop = new Delegate();
  this.update = new Delegate();
  this.render = new Delegate();
  this.width = options.width || 640;    // TODO: allow 'null' to use width of target canvas
  this.height = options.height || 640;  // TODO: allow 'null' to use height of target canvas
  this._initialized = false;
}
Gesso.Controller = Controller;
Gesso.Delegate = Delegate;
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
  return this.update.invoke();
};
Gesso.prototype.renderTo = function renderTo(context) {
  return this.render.invoke(context);
};
Gesso.prototype.run = function run(canvas) {
  var controller = new Controller(this, canvas);
  controller.start();
  return controller;
};


module.exports = Gesso;
