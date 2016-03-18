module.exports = {
  startsWith: function (string, prefix) {
    return string.indexOf(prefix, 0) === 0;
  },

  endsWith: function (string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
  }
};
