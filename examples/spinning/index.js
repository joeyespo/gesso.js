// Get the canvas context
var gesso = require('gesso');
var canvas = gesso.getCanvas();
var ctx = canvas.getContext('2d');


function fillRotatedRect(x, y, width, height, angle) {
  // Get the origin of the rectangle around its center
  var originX = width / 2;
  var originY = height / 2;

  // Save the unrotated context of the canvas so we can restore it later
  ctx.save();

  // Rotate the around the origin, given the specified offset
  ctx.translate(x + originX, y + originY);
  ctx.rotate(angle);

  // After transforming, (0,0) is visually (-originX,-originY), so the box
  // needs to be offset accordingly
  ctx.fillRect(-originX, -originY, width, height);

   // We're done with the rotating, so restore to the unrotated context
  ctx.restore();
}


// Draw a spinning box at each frame step
function step(timestamp) {
  // Calculate a base of one rotation per second
  var seconds = timestamp / 1000;
  var angle = seconds * (Math.PI / 2);

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw a box, spinning with time
  ctx.fillStyle = '#f34';
  fillRotatedRect(50, 100, 200, 20, angle * 4);

  // Draw a box spinning at a slower speed
  ctx.fillStyle = '#3cf';
  fillRotatedRect(200, 250, 200, 200, angle * 2);

  // Draw a box
  ctx.fillStyle = '#cf8';
  fillRotatedRect(400, 50, 200, 150, -angle / 2);

  // Re-register for the next frame
  gesso.requestAnimationFrame(step);
}


// Register the animation frame
gesso.requestAnimationFrame(step);
