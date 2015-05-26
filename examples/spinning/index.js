var Gesso = require('gesso');
var fillRotatedRect = require('./helpers').fillRotatedRect;

// Create the game object
var game = new Gesso();

// We'll use closures for game variables
var angle = 0;

// This gets called every frame.
// Update your game state here.
game.update(function (t) {
  // Calculate one rotation per second, in radians
  angle = (2 * Math.PI / 60) * t;
});

// This gets called at least once per frame. You can call
// Gesso.renderTo(target) to render the game to another canvas.
game.render(function (ctx) {
  // Clear the canvas
  ctx.clearRect(0, 0, game.width, game.height);

  // Draw a red box, rotating four times per second
  ctx.fillStyle = '#f34';
  fillRotatedRect(ctx, 50, 100, 200, 20, angle);

  // Draw a green box, fully rotating every two seconds
  ctx.fillStyle = '#cf8';
  fillRotatedRect(ctx, 400, 50, 200, 150, -angle / 8);

  // Draw a blue box, fully rotating two times per second
  ctx.fillStyle = '#3cf';
  fillRotatedRect(ctx, 200, 250, 200, 200, angle * 0.5);
});

// Export the game object
module.exports = game;

game.run();  // TODO: Delete this
