/**
 * Created by bob on 13-11-30.
 */
var JSONStream = require('JSONStream'),
  fs = require('fs'),
  _ = require('underscore'),
  util = require('util');
var assessment = require('./assessment');

var startTime = new Date().getTime();

assessment('./Hangouts.json', function(err, count){
  if(err) {
    console.log(err);
  } else {
    var cost = new Date().getTime() - startTime;
    console.log('total:'+count + ' cost ' + cost + 'ms');
  }
});

//
//var currentKey = '';
//var currentSubKey = '';
//
//var events_index = {};
//
//var stream = JSONStream.parse(['conversation_state', true, 'conversation_state', function (key) {
//  currentKey = key;
//  return key === 'conversation' || key === 'event';
//
//}, function (key) {
//  if (currentKey === 'event') {
//    currentSubKey = '';
//    return true;
//  } else if (currentKey === 'conversation') {
//    currentSubKey = key;
//    if (key === 'id') {
//      return true;
//    } else if (key === 'participant_data') {
//      return true;
//    } else if (key === 'type') {
//      return true;
//    } else if (key === 'name') {
//      return true;
//    }
//  }
//  return false;
//}]);
//
//
//stream.on('data', function (data) {
//  if (currentKey === 'event') {
////    console.log(data.chat_message);
//    if(!data.chat_message) {
////      console.log(util.inspect(data, {depth: null}));
//      if(data.membership_change) {
//        if(!events_index['membership_change']) {
//          events_index['membership_change'] = {};
//        }
//        events_index['membership_change'][data.membership_change.type] = 1;
////        console.log(util.inspect(data, {depth: null}));
//      } else if(data.hangout_event) {
//        if(!events_index['hangout_event']) {
//          events_index['hangout_event'] = {};
//        }
//        events_index['hangout_event'][data.hangout_event.event_type] = 1;
//        console.log(util.inspect(data, {depth: null}));
//      } else if(data.conversation_rename) {
//        events_index['conversation_rename'] = 1;
////        console.log(util.inspect(data, {depth: null}));
//      }
//
//    } else {
//      var message_content = data.chat_message.message_content;
//
//      _.each(message_content, function(value, key) {
//        if(!events_index[key]) {
//          events_index[key] = {};
//        }
//        if(key == 'attachment') {
//          for(var i = 0; i < value.length; i++) {
//            var embedItem = value[i].embed_item;
//            if(embedItem) {
////              console.log(util.inspect(embedItem.type, {depth: null}));
//
//              _.each(embedItem.type, function(type) {
//                if(!events_index[key][type]) {
//                  events_index[key][type] = 1;
//                } else {
//                  events_index[key][type]++;
//                }
//              });
//            } else {
//              console.log(util.inspect(value[i], {depth: null}));
//            }
//          }
//
//
//        } else {
//          _.each(value, function(element, index){
//            if(!events_index[key][element.type]) {
//              events_index[key][element.type] = 1;
//            } else {
//              events_index[key][element.type]++;
//            }
//          });
//        }
//
//
//      });
//
//    }
//
//  }
//});
//
//stream.on('root', function(root, count) {
//  console.log('total' + count);
//  console.log(events_index);
//});
//
//fs.createReadStream('./Hangouts.json', {encoding: 'utf8'}).pipe(stream);