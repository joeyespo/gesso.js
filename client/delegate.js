var util = require('./util');


// Returns a callable object that, when called with a function, subscribes
// to the delegate. Call invoke on this object to invoke each handler.
function Delegate() {
  var self = this;
  self.handlers = [];
  function callable(handler) {
    if (arguments.length !== 1) {
      throw new Error('Delegate takes exactly 1 argument (' + arguments.length + ' given)');
    } else if (typeof handler !== 'function') {
      throw new Error('Delegate argument must be a Function object (got ' + typeof handler + ')');
    }
    self.handlers.push(handler);
    return function unsubscribe() {
      return util.removeLast(self.handlers, handler);
    };
  }
  callable.invoke = function invoke() {
    var args = arguments;
    util.forEach(self.handlers, function (handler) {
      handler.apply(null, args);
    });
  };
  return callable;
}


module.exports = Delegate;
