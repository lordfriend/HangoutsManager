var fs = require('fs'),
  _ = require('underscore');

var DEFAULT_CONFIG = {
  server: {
    port: 8000,
    host: 'localhost',
    contextRoot: '/'
  },
  selfUserId: '',
  selfUserName: '',
  selfUserImageUrl: '',
  useProxy: false
};

var configFilePath = './config.json';

function checkConfigSync() {
  var stats;
  try {
    stats = fs.statSync(configFilePath);
    if (stats.isFile()) {
      var config = fs.readFileSync(configFilePath);
      try {
        global.config = JSON.parse(config);
        var configIsValid = validateConfig();
        if (!configIsValid) {
          console.log('invalid config');
          initConfigFile();
        }
      } catch (e) {
        console.log(e);
        initConfigFile();
      }
    } else {
      console.log('not a file');
      initConfigFile();
    }
  } catch (e) {
    console.log(e);
    initConfigFile();
  }

}

function initConfigFile() {
  global.config = DEFAULT_CONFIG;
  fs.writeFile(configFilePath, JSON.stringify(DEFAULT_CONFIG), function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('default config file created!');
    }
  });
}

function updateConfigFile(callback) {
  if(validateConfig()) {
    fs.writeFile(configFilePath, JSON.stringify(global.config), callback);
  } else {
    callback('error: config is invalid');
  }
}

function validateConfig() {
  return _.isObject(global.config.server) &&
    _.isNumber(global.config.server.port) &&
    _.isString(global.config.server.host) &&
    _.isString(global.config.server.contextRoot) &&
    _.isString(global.config.selfUserId) &&
  _.isBoolean(global.config.useProxy);
}

exports.checkConfigSync = checkConfigSync;

exports.updateConfigFile = updateConfigFile;