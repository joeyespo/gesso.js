// Raf polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
// Adapted to CommonJS by Joe Esposito
// Origin: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
//         https://gist.github.com/paulirish/1579671

var raf = (function () {
  var requestAnimationFrame = null;
  var cancelAnimationFrame = null;

  if (typeof window !== 'undefined') {
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    requestAnimationFrame = window.requestAnimationFrame;
    cancelAnimationFrame = window.cancelAnimationFrame;
    for(var x = 0; x < vendors.length && !requestAnimationFrame; ++x) {
      requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
  }

  if (!requestAnimationFrame) {
    var lastTime = 0;
    requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
    cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }

  return {
    requestAnimationFrame: function(callback) { return requestAnimationFrame(callback); },
    cancelAnimationFrame: function(requestID) { return cancelAnimationFrame(requestID); }
  };
})();

module.exports = raf;
