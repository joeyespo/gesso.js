function startsWith(string, prefix) {
  return string.lastIndexOf(prefix, 0) === 0;
}

function startsWithAny(string, prefixes) {
  for (var index = 0; index < prefixes.length; index++) {
    if (startsWith(string, prefixes[index])) {
      return true;
    }
  }
  return false;
}


module.exports = {
  startsWith: startsWith,
  startsWithAny: startsWithAny
};
