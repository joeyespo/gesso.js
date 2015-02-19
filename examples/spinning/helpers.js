// Draws a rectangle rotated at the specified angle (in radians)
function fillRotatedRect(ctx, x, y, width, height, angle) {
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


module.exports = {
  fillRotatedRect: fillRotatedRect
};
