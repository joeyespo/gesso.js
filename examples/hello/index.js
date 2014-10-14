// Get the canvas context
var gesso = require('gesso');
var ctx = gesso.getContext2D();

// Draw two lines of text
ctx.font = '36px Verdana';
ctx.fillStyle = '#f34';
ctx.fillText('Hello,', 123, 100);
ctx.shadowColor = '#f0f';
ctx.shadowBlur = 8;
ctx.fillText('Browser Games!', 26, 150);
