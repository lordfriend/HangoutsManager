/**
 * Created by bob on 13-11-7.
 */

var indexBuilder =  require('../index-builder'),
  postProcessor = require('../postProcessor'),
  configManager = require('../configManager'),
  fileBrowser = require('../file-browser');

var build_message = [];
var call_back = [];

var appendMessage = function(json) {
  if(call_back.length > 0) {
    var callback = call_back.shift();
    callback(json);
  } else {
    build_message.push(json);
  }
};

var queryMessage = function(callback) {
  if(build_message.length > 0) {
    var message = build_message.shift();
    callback(message);
  } else {
    call_back.push(callback);
  }
};

exports.checkIndexAPI = function(req, res) {

};

exports.getBuildProgressAPI = function(req, res) {
  queryMessage(function(message) {
    res.json(200, message);
  });
};

exports.buildIndexAPI = function(req, res) {
  var path = req.body.path;

  build_message = [];
  var builder = indexBuilder.buildIndex(path);

  builder.on('events', function(err, fileName){
    appendMessage({event: 'events', data: fileName});
  });

  builder.on('eventsIndex', function(err, event){
    appendMessage({event: 'eventsIndex', data: event})
  });

  builder.on('success', function(err, count){
    postProcessor.indexPostProcess(function(err, participants){
      if(err) {
        appendMessage({event: 'end', data: 'error'});
        res.json(500, {
          msg: err
        })
      } else {
        appendMessage({event: 'end', data: 'ok'});
        res.json(200, {
          msg: 'done',
          count: count,
          participants: participants
        });
      }

    })
  });

  builder.on('error' ,function(err){
    res.json(500, {
      msg: err
    })
  });
};

exports.setProxyAPI = function(req, res) {
  global.config.proxy = req.body.proxy;
  configManager.updateConfigFile(function(err){
    if(err) {
      res.json(500, {
        msg: err
      });
    } else {
      res.json(200, {
        msg: 'ok'
      });
    }
  });
};

exports.getProxyAPI = function(req, res) {
  var proxy = global.config.proxy;
  var useProxy = global.config.useProxy;
  res.json(200, {
    proxy: proxy || '',
    useProxy: useProxy
  });
};

exports.enableProxyAPI = function(req, res) {
  global.config.useProxy = req.body.useProxy;
  configManager.updateConfigFile(function(err) {
    if(err) {
      res.json(500, {
        msg: err
      });
    } else {
      res.json(200, {
        msg: 'ok'
      });
    }
  });
};

exports.getTimezone = function(req, res) {
  var timezoneOffset = global.config.timezone;
  var timezoneMap = global.config.TIME_ZONE_MAP;
  res.json(200, {
    timezone: timezoneOffset,
    timezone_map: timezoneMap
  });
};

exports.setTimezone = function(req, res) {
  global.config.timezone = req.body.timezone;
  configManager.updateConfigFile(function(err) {
    if(err) {
      res.json(500, {
        msg: err
      });
    } else {
      res.json(200, {
        msg: 'ok'
      });
    }
  });
};