/**
 * Created by bob on 13-11-7.
 */

var fs = require('fs');

exports.indexAPI = function(req, res) {
  res.set('Content-Type', 'application/json;charset=utf-8');

  var indexStream = fs.createReadStream('./indexes/index.json');
  indexStream.on('data', res.write.bind(res));
  indexStream.on('close', function () {
    res.end();
  });
  indexStream.on('error', function (error) {
    res.json(500, {
      msg: error
    })
  });
}