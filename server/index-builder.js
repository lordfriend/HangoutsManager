/**
 * Index builder is used to build index from original json data file.
 * The json data file should place in /data/ folder
 * User: lordfriend
 * Date: 13-8-24
 */
var JSONStream = require('JSONStream'),
  fs = require('fs'),
  taskQueue = require('./task-queue.js'),
  _ = require('underscore');
  EventEmitter = require('events').EventEmitter;


exports.buildIndex = function (archiveFileName) {

  var emitter = new EventEmitter();

  var currentKey = '';
  var currentSubKey = '';

  var conversations = [];

  var events = [];
  var firstTimestamp = 0;
  var lastTimestamp = 0;

  var MAX_EVENTS_LENGTH = 2600;
  var events_index = {};
  var lastConversationId;

  var stream = JSONStream.parse(['conversation_state', true, 'conversation_state', function (key) {
    currentKey = key;
    return key === 'conversation' || key === 'event';

  }, function (key) {
    if (currentKey === 'event') {
      currentSubKey = '';
      return true;
    } else if (currentKey === 'conversation') {
      currentSubKey = key;
      if (key === 'id') {
        return true;
      } else if (key === 'participant_data') {
        return true;
      } else if (key === 'type') {
        return true;
      } else if (key === 'name') {
        return true;
      }
    }
    return false;
  }]);

  function writeEvents() {
    var worker = this;
    var fileName = 'indexes/' + worker.data.conversationId + '/' + worker.data.fTimeStamp + '-' + worker.data.lTimeStamp + '.json';
    fs.writeFile(fileName, JSON.stringify(worker.data.eventArray), function (err) {
      if (err) {
        console.log('error occurred!' + err);
        emitter.emit('events', err);
      } else {
        console.log('File ' + fileName + ' saved!');
        emitter.emit('events', null, fileName);
      }
      worker.callback();
    });
  }

  function createEventsIndex() {
    var worker = this;
    var fileName = 'indexes/' + worker.data.conversationId + '/' + 'index.json';
    fs.writeFile(fileName, JSON.stringify(worker.data.eventsIndex), function (err) {
      if (err) {
        console.log('error creating index of ' + worker.data.conversationId);
        emitter.emit('eventsIndex', err);
      } else {
        console.log('index of ' + worker.data.conversationId + ' created!');
        emitter.emit('eventsIndex', null, {id: worker.data.conversationId, fileName: fileName});
      }
      worker.callback();
    })
  }

  function createConversationFolder() {
    var id = this.data.id;
    var worker = this;
    fs.stat('indexes/' + id, function (err) {
      if (err) {
        console.log('directory [' + id + '] not exists, creating...');
        fs.mkdir('indexes/' + id, function (error) {
          if (error) {
            console.error('error occurred! ');
          } else {
            console.log('directory create completed!');
          }
          // make sure to invoke the callback of the Worker when finishing the task
          worker.callback();
        });
      } else {
        worker.callback();
      }
    });
  }

  function removeConversationFolder() {
    var id = this.data.conversationId;
    var worker = this;
    fs.stat('indexes/' + id, function (err) {
      if (!err) {
        fs.rmdir('indexes/' + id, function (err) {
          if (err) {
            console.error('remove empty folder ' + id + ' failed!');
          } else {
            console.log('empty folder: ' + id + ' removed!')
          }
          worker.callback();
        })
      } else {
        worker.callback();
      }
    });
  }

  function eventsCheck() {

    if (events.length > 0) {
      // when a new conversation arrived, all events of last conversation should be written to file even their size is not reach the limit.
      taskQueue.addWorker({
        eventArray: events.slice(),
        conversationId: lastConversationId,
        fTimeStamp: firstTimestamp,
        lTimeStamp: lastTimestamp
      }, writeEvents);
      _.each(events, function (event) {
        // make sure all the event with the event_id in events array is assigned with a file name
        events_index[event.event_id]['file'] = 'indexes/' + lastConversationId + '/' + firstTimestamp + '-' + lastTimestamp + '.json';
      });
      events = [];
    }

    if (_.size(events_index) > 0) {
      conversations[conversations.length - 1].eventCount = _.size(events_index);
      taskQueue.addWorker({conversationId: lastConversationId, eventsIndex: _.clone(events_index)}, createEventsIndex);
      events_index = {};
    } else {
      // if events_index is empty and last conversation is exist. remove it and delete the folder with the name of conversationId.
      if (conversations.length > 0) {
        var removed = conversations.pop();
        // if revokeWorker return true, the conversation folder is not created. otherwise we need to delete this folder
        if (!taskQueue.revokeWorker(removed.taskId)) {
          taskQueue.addWorker({conversationId: lastConversationId}, removeConversationFolder);
        } else {
          console.log('empty conversation ' + lastConversationId + ' folder creation worker revoked!');
        }
      }
    }
  }

  stream.on('data', function (data) {
    if (currentKey === 'conversation') {
      if (currentSubKey === 'id') {
        // events and events_index should be done before new conversation id pushed.
        eventsCheck();

        var conversation = {
          id: data.id
        };
        conversation.taskId = taskQueue.addWorker({id: data.id}, createConversationFolder);

        conversations.push(conversation);

        lastConversationId = data.id;
      } else if (currentSubKey === 'participant_data') {
        conversations[conversations.length - 1].participant_data = data;
      } else if (currentSubKey === 'type') {
        conversations[conversations.length - 1].type = data;
      } else if (currentSubKey === 'name') {
        conversations[conversations.length - 1].name = data;
      }
    } else {
      if (events.length <= MAX_EVENTS_LENGTH) {
        if (events.length == 0) {
          firstTimestamp = data.timestamp;
        }
        events.push(data);
        events_index[data.event_id] = {
          timestamp: data.timestamp
        };
        lastTimestamp = data.timestamp;
      } else {
        taskQueue.addWorker({
          eventArray: events.slice(),
          conversationId: lastConversationId,
          fTimeStamp: firstTimestamp,
          lTimeStamp: lastTimestamp
        }, writeEvents);
        _.each(events, function (event) {
          // make sure all the event with the event_id in events array is assigned with a file name
          events_index[event.event_id]['file'] = 'indexes/' + lastConversationId + '/' + firstTimestamp + '-' + lastTimestamp + '.json';
        });
        events = [];
      }
    }
  });

  stream.on('root', function (root, count) {
    console.log('count = ' + count);
    // the last events check will be missed. so we need to deal with it here.
    eventsCheck();

    taskQueue.addWorker({conversationArray: conversations}, function () {
      var worker = this;
      _.each(this.data.conversationArray, function (conversation) {
        delete conversation.taskId;
      });
      fs.writeFile('indexes/index.json', JSON.stringify(this.data.conversationArray), function (err) {
        if (err) {
          console.log('creating conversation index error, ' + err);
        } else {
          console.log('conversation index file created!');
          emitter.emit('success', count);
        }
        worker.callback();
      });
    });
  });

  function startBuild() {
    var worker = this;
    fs.stat(worker.data.archiveFileName, function (err) {
      if (err) {
        emitter.emit('error', err);
      } else {
        fs.createReadStream(worker.data.archiveFileName, {encoding: 'utf8'}).pipe(stream);
      }
      worker.callback();
    });
  }

  function buildIndexDirectory() {
    var worker = this;
    fs.stat('./indexes', function(error, stats) {
      if(error || !stats.isDirectory()) {
        fs.mkdir('./indexes', function(err){
          worker.callback();
        });
      } else {
        worker.callback();
      }
    });
  }
  taskQueue.addWorker({}, buildIndexDirectory);
  taskQueue.addWorker({archiveFileName: archiveFileName}, startBuild);

  return emitter;
};
//
//fs.createReadStream('./chat.json', {encoding: 'utf8'}).pipe(stream);