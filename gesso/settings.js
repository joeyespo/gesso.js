var util = require('util');


var settings = {
  DEBUG: process.env.DEBUG === 'true',
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000
};


// Optionally merge with local settings
try {
  util._extend(settings, require('./settings-local'));
}
catch (e) {
}


module.exports = settings;
