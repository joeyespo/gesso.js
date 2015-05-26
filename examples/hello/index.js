var Gesso = require('gesso');

var game = new Gesso();
var x;

game.update(function (t) {
  var center = (game.width - 300) / 2;
  x = center + Math.sin(t / 15) * 20;
});

game.render(function (ctx) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(0, 0, game.width, game.height);

  ctx.font = '36px Verdana';
  ctx.fillStyle = '#f34';
  ctx.fillText('Hello,', 270, 200);
  ctx.fillText('Browser Games!', x, 252);
});

game.run();
