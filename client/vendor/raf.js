// Raf polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// Adapted by Joe Esposito
// Origin: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
//         http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// MIT license

var raf = (function () {
  var requestAnimationFrame = typeof window !== 'undefined' ? window.requestAnimationFrame : null;
  var cancelAnimationFrame = typeof window !== 'undefined' ? window.cancelAnimationFrame : null;

  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !requestAnimationFrame; ++x) {
    requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
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
