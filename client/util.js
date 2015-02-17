function forEach(array, stepFunction) {
  for (var index = 0; index < array.length; index++) {
    stepFunction(array[index]);
  }
}


function pop(array, index) {
  return typeof index === 'undefined' ? array.pop() : array.splice(index, 1)[0];
}


function indexOf(array, item, startIndex) {
  for (var index = startIndex || 0; index < array.length; index++) {
    if (array[index] === item) {
      return index;
    }
  }
  return -1;
}


function lastIndexOf(array, item, startIndex) {
  for (var index = startIndex || array.length - 1; index >= 0; index--) {
    if (array[index] === item) {
      return index;
    }
  }
  return -1;
}


function remove(array, item) {
  var index = indexOf(array, item);
  return index !== -1 ? pop(array, index) : null;
}


function removeLast(array, item) {
  var index = lastIndexOf(array, item);
  return index !== -1 ? pop(array, index) : null;
}


module.exports = {
  forEach: forEach,
  pop: pop,
  indexOf: indexOf,
  lastIndexOf: lastIndexOf,
  remove: remove,
  removeLast: removeLast
};
