var Gesso = require('gesso');
var fillRotatedRect = require('./helpers').fillRotatedRect;

// Create the game object
var game = new Gesso();

// We'll use closures for game variables
var seconds = 0;

// This gets called every frame. Update your game state here.
game.update(function () {
  // Calculate the time passed, based on 60 frames per second
  seconds += 1 / 60;
});

// This gets called at least once per frame. You can call
// Gesso.renderTo(target) to render the game to another canvas.
game.render(function (ctx) {
  // Calculate one rotation per second
  var angle = seconds * (Math.PI / 2);

  // Clear the canvas
  ctx.clearRect(0, 0, game.width, game.height);

  // Draw a red box, rotating four times per second
  ctx.fillStyle = '#f34';
  fillRotatedRect(ctx, 50, 100, 200, 20, angle * 4);

  // Draw a green box, fully rotating every two seconds
  ctx.fillStyle = '#cf8';
  fillRotatedRect(ctx, 400, 50, 200, 150, -angle / 2);

  // Draw a blue box, fully rotating two times per second
  ctx.fillStyle = '#3cf';
  fillRotatedRect(ctx, 200, 250, 200, 200, angle * 2);
});

// Run the game
game.run();
