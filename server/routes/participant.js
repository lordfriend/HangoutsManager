/**
 * Created by bob on 13-11-7.
 */

var fs = require('fs');

exports.participantAPI = function(req, res) {
  res.set('Content-Type', 'application/json;charset=utf-8');
  var participantStream = fs.createReadStream('./indexes/participants.json');
  participantStream.on('data', res.write.bind(res));
  participantStream.on('close', function(){
    console.log('close');
    res.end();
  });
  participantStream.on('error', function(error){
    res.json(500, {
      'msg': error
    });
  });
};

exports.googleAPI = function(req, res) {
  res.set('Content-Type', 'application/json;charset=utf-8');
  var googleApiStream = fs.createReadStream('./googleAPI.json');
  googleApiStream.on('data', res.write.bind(res));
  googleApiStream.on('close', function(){
    res.end();
  });
  googleApiStream.on('error', function(error){
    console.log(error);
    res.json(500, {
      'msg': error
    })
  })
};

exports.saveParticipantAPI = function(req, res) {
  var participants = req.body.participants;
  console.log(participants);
  res.set('Content-Type', 'application/json;charset=utf-8');
  if(participants) {
    fs.writeFile('./indexes/participants.json', JSON.stringify(participants), function(err){
      if(err){
        res.json(500, {
          msg: err
        })
      } else {
        res.json(200, {
          msg: 'ok'
        });
      }
    })
  }
};