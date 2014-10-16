var util = require('util');


var settings = {
  DEBUG: process.env.DEBUG === 'true',
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 63550,
  CANVAS_ID: process.env.CANVAS_ID || 'gesso-target',
  CANVAS_WIDTH: process.env.CANVAS_WIDTH ? parseInt(process.env.CANVAS_WIDTH, 10) : 640,
  CANVAS_HEIGHT: process.env.CANVAS_HEIGHT ? parseInt(process.env.CANVAS_HEIGHT, 10) : 480
};


// Optionally merge with local settings
try {
  util._extend(settings, require('./settings-local'));
}
catch (e) {
}


module.exports = settings;
