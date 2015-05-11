var util = require('./util');


// Returns a callable object that, when called with a function, subscribes
// to the delegate. Call invoke on this object to invoke each handler.
function Delegate(subscribed, unsubscribed) {
  var handlers = [];

  function callable(handler) {
    if (arguments.length !== 1) {
      throw new Error('Delegate takes exactly 1 argument (' + arguments.length + ' given)');
    } else if (typeof handler !== 'function') {
      throw new Error('Delegate argument must be a Function object (got ' + typeof handler + ')');
    }
    // Add the handler
    handlers.push(handler);
    // Allow custom logic on subscribe, passing in the handler
    var subscribedResult;
    if (subscribed) {
      subscribedResult = subscribed(handler);
    }
    // Return the unsubscribe function
    return function unsubscribe() {
      var initialHandler = util.removeLast(handlers, handler);
      // Allow custom logic on unsubscribe, passing in the original handler
      if (unsubscribed) {
        unsubscribed(initialHandler, subscribedResult);
      }
      // Return the original handler
      return initialHandler;
    };
  }
  callable.invoke = function invoke() {
    var args = arguments;
    util.forEach(handlers, function (handler) {
      handler.apply(null, args);
    });
  };
  // Expose handlers for inspection
  callable.handlers = handlers;

  return callable;
}


module.exports = Delegate;
