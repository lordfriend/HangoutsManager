/**
 * Created by bob on 13-9-30.
 */
var fs = require('fs'),
  taskQueue = require('./task-queue'),
  _ = require('underscore');

exports.indexPostProcess = function(callback){

  var participants = {};

  function checkEvents() {
    console.log('check events');
    var self = this;
    var conversationId = self.data.conversationId;
    var complete = 0;
    fs.readFile('./indexes/' + conversationId + '/index.json', function(err, data) {
      if(err) {
        self.callback();
      } else {
        var events_index = JSON.parse(data);
        var files = [];
        _.each(events_index, function(value) {
          files[value.file] = true;
        });
//        console.log(files);
        if(_.size(files) == 0) {
          self.callback();
        }

        _.each(events_index, function(value, file){
          fs.readFile(file, function(error, events_data) {
            if(error) {

            } else {
              var events = JSON.parse(events_data);
              for(var i = 0; i <events.length; i++) {
                if(events[i].membership_change) {
                  if(events[i].membership_change.type == 'LEAVE') {
                    for(var j = 0; j < events[i].membership_change.participant_id.length; j++) {
                      if(!participants[events[i].membership_change.participant_id[j]]) {
                        participants[events[i].membership_change.participant_id[j]] = true;
                      }
                    }
                  }
                }
              }
            }

            complete++;
//            console.log(participants);
            if(complete == _.size(files)) {
              self.callback();
            }
          });
        });
      }
    });
  }

  function saveParticipantFile() {
    var self = this;
    console.log(participants);
    fs.writeFile('./indexes/participants.json', JSON.stringify(participants), function(err){
      if(err){
        callback(err);
      } else {
        callback(null, participants);
      }

      self.callback();
    });
  }

  fs.readFile('./indexes/index.json', {encoding: 'utf8'}, function(error, data){

//    console.log(data);
    try {
      var index = JSON.parse(data);

      _.each(index, function (value) {
        if(value.participant_data) {
          for (var i = 0; i < value.participant_data.length; i++) {
            var participant = value.participant_data[i];
            participants[participant.id.gaia_id] = {fallback_name: participant.fallback_name};
          }
        }
        if(value.type == 'GROUP') {
          taskQueue.addWorker({conversationId: value.id}, checkEvents);
        }
      });
//      toBeDone = _.size(participants);
      taskQueue.addWorker({}, saveParticipantFile);
//      saveParticipantFile();
    } catch (e) {
      console.log(e);
      callback(e);
    }
  });
};