/**
 * Created by bob on 13-12-7.
 */
var JSONStream = require('JSONStream'),
  fs = require('fs'),
  _ = require('underscore'),
  util = require('util');

module.exports = function(archiveFileName, callback) {
  var stream = JSONStream.parse(['conversation_state', true]);

  stream.on('root', function(root, count) {
    callback(null, count);
  });

  fs.stat(archiveFileName, function (err) {
    if (err) {
      callback(err, null);
    } else {
      fs.createReadStream(archiveFileName, {encoding: 'utf8'}).pipe(stream);
    }
  });
};