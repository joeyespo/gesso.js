function getCanvas() {
  // TODO: Read the project settings use the right ID
  var canvas = window.document.getElementById('gesso-target');

  if (!canvas) {
    var canvases = window.document.getElementsByTagName('canvas');
    if (canvases.length === 1) {
      canvas = canvases[0];
    }
  }

  if (!canvas) {
    throw new Error('Canvas not found.');
  }

  return canvas;
}


function getContext2D() {
  return getCanvas().getContext('2d');
}


function getWebGLContext() {
  return getCanvas().getContext('webgl');
}


module.exports = {
  getCanvas: getCanvas,
  getContext2D: getContext2D,
  getWebGLContext: getWebGLContext
};
