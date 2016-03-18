// TODO: Logger class
// TODO: Pluggable log backend, e.g. console.log

// http://stackoverflow.com/questions/6418220/javascript-send-json-object-with-ajax
// http://stackoverflow.com/questions/9713058/sending-post-data-with-a-xmlhttprequest
// http://stackoverflow.com/questions/332872/encode-url-in-javascript
function _send(level, args) {
  var payload = (
    'level=' + encodeURIComponent(level) +
    '&message=' + encodeURIComponent(args.join(' ')));

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/log');
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function () {
    // Check for error state
    if (xhr.readyState === 4 && xhr.status !== 200) {
      // TODO: Notify user on the page and show message if console.log doesn't exist
      if (console && console.log) {
        console.log(xhr.responseText);
      }
    }
  };
  xhr.send(payload);
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
