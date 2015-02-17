/* globals $ */


// TODO: Logger class
// TODO: Pluggable log backend, e.g. console.log


function _send(level, args) {
  // TODO: Remove the implied jQuery dependency
  $.post('/log', {
    level: level,
    message: args.join(' ')
  }).fail(function(xhr, textStatus, errorThrown) {
    // TODO: Notify user on the page and show message if console.log doesn't exist
    if (console && console.log) {
      console.log(xhr.responseText);
    }
  });
}


function error(message) {
  return _send('error', Array.prototype.slice.call(arguments));
}


function info(message) {
  return _send('info', Array.prototype.slice.call(arguments));
}


function log(message) {
  return _send('log', Array.prototype.slice.call(arguments));
}


function warn(message) {
  return _send('warn', Array.prototype.slice.call(arguments));
}


module.exports = {
  error: error,
  info: info,
  log: log,
  warn: warn
};
