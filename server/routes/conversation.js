/**
 * Created by bob on 13-11-7.
 */

var fs = require('fs'),
  _ = require('underscore'),
  util = require('util'),
  moment = require('moment');

var archive = function (eventIds) {
  var archives = [];
  var start = moment().valueOf();
  console.log('data length:' + eventIds.length);
  if(eventIds.length == 1) {
    archives.push({
      month: moment(eventIds[0].timestamp/1000).format('YYYY/M'),
      event_count: 1,
      event_range: [eventIds[0], eventIds[0]]
    });
  } else if(eventIds.length < 10 && eventIds.length > 1) {
    // we'll display only start and end month
    archives.push({
      month: moment(eventIds[0].timestamp/1000).format('YYYY/M') + ' - ' + moment(eventIds[eventIds.length - 1].timestamp/1000).format('YYYY/M'),
      event_count: eventIds.length,
      event_range: [eventIds[0], eventIds[eventIds.length - 1]]
    });
  } else {
    var monthly = [[moment(eventIds[0].timestamp/1000).startOf('month'), moment(eventIds[0].timestamp/1000).endOf('month')]];
    var monthIncrement = 0;
    archives.push({month: moment(eventIds[0].timestamp/1000).format('YYYY/M')});

    while(monthly[monthIncrement][1].valueOf() < eventIds[eventIds.length -1].timestamp/1000) {
      monthly.push([monthly[monthIncrement][0], monthly[monthIncrement][1]]);
      monthly[monthIncrement] = [monthly[monthIncrement][0].valueOf(), monthly[monthIncrement][1].valueOf()];
      monthIncrement++;
      var nextMonthOffset = monthly[monthIncrement][0].add('month', 1).valueOf();
      monthly[monthIncrement][0] = moment(nextMonthOffset).startOf('month');
      monthly[monthIncrement][1] = moment(nextMonthOffset).endOf('month');
      archives.push({month: monthly[monthIncrement][0].format('YYYY/M'), event_count: 0});
    }
    monthly[monthIncrement] = [monthly[monthIncrement][0].valueOf(), monthly[monthIncrement][1].valueOf()];
//    console.log(monthly);
    var lPoint = 0;
    var rPoint = eventIds.length - 1;
    monthIncrement = 0;
    var monthDecrement = monthly.length - 1;
//    var count = 0;
    while(lPoint < rPoint) {
      if(eventIds[lPoint].timestamp/1000 >= monthly[monthIncrement][0] && eventIds[lPoint].timestamp/1000 <= monthly[monthIncrement][1]) {
        if(!archives[monthIncrement].event_range) {
          archives[monthIncrement].event_range = [eventIds[lPoint], {timestamp:0}];
        } else if(archives[monthIncrement].event_range[1].timestamp < eventIds[lPoint].timestamp) {
          archives[monthIncrement].event_range[1] = eventIds[lPoint];
        } else if(archives[monthIncrement].event_range[0].timestamp > eventIds[lPoint].timestamp) {
          archives[monthIncrement].event_range[0] = eventIds[lPoint];
        }
        archives[monthIncrement].event_count++;
        lPoint++;
      } else if(monthIncrement < monthly.length - 1) {
        monthIncrement++;
      }
      if(eventIds[rPoint].timestamp/1000 >= monthly[monthDecrement][0] && eventIds[rPoint].timestamp/1000 <= monthly[monthDecrement][1]) {
        if(!archives[monthDecrement].event_range) {
          archives[monthDecrement].event_range = [eventIds[rPoint], eventIds[rPoint]];
        } else if(archives[monthDecrement].event_range[0].timestamp > eventIds[rPoint].timestamp) {
          archives[monthDecrement].event_range[0] = eventIds[rPoint];
        } else if(archives[monthDecrement].event_range[1].timestamp < eventIds[rPoint].timestamp) {
          archives[monthDecrement].event_range[1] = eventIds[rPoint];
        }
        archives[monthDecrement].event_count++;
        rPoint--;
      } else if(monthDecrement > 0){
        monthDecrement--;
      }
//      console.log('lPoint: '+ lPoint + ' rPoint: ' + rPoint + ' monthIncrement: ' + monthIncrement + ' monthDecrement: ' + monthDecrement +' count: ' + (count++));
    }

    for(var i = 0; i < archives.length; i++) {
      if(!archives[i].event_range) {
        archives.splice(i, 1);
        i--;
      }
    }

//    console.log(archives);

  }

  console.log('time cost:' + (moment().valueOf()-start) +'ms');
  return archives;
};

exports.dataListAPI = function(req, res) {
  var conversationId = req.params.conversationId;
  var fileName = 'indexes/' + conversationId + '/index.json';
  fs.readFile(fileName, function (err, data) {
    if (!err) {
      try {
        var events = JSON.parse(data);
        var timestampsArray = _.sortBy(_.map(events, function (value, id) {
          return {timestamp: parseInt(value.timestamp, 10), event_id: id};
        }), function (item) {
          return item.timestamp;
        });

        var result = {
          eventIds: timestampsArray,
          archive: archive(timestampsArray)
        };
        res.json(200, result);
      } catch (exception) {
        console.error(exception);
        res.json(500, {
          msg: 'json parse error: ' + util.inspect(exception)
        });
      }
    } else {
      console.error(err);
      res.json(500, {
        msg: err
      })
    }
  });
};

exports.eventsAPI = function(req, res) {
  var conversationId = req.params.conversationId;
  var eventIds = req.body.eventIds;
//  console.log(eventIds);
  fs.readFile('indexes/' + conversationId + '/index.json', function (err, data) {
    if (err) {
      console.error(err);
      res.json(500, {
        msg: err
      });
    } else {
      try {
        var index = JSON.parse(data);
        var fileList = {};
//        console.log(index);
        _.each(eventIds, function (event_id) {
          fileList[index[event_id].file] = true;
        });
        var events = [];
        var completeCount = 0;
        _.each(fileList, function (key, fileName) {
          fs.readFile(fileName, function (err, data) {
            if (!err) {
              JSON.parse(data).forEach(function (event) {
                if (eventIds.some(function (id) {
                  return id === event.event_id;
                })) {
                  // find an corresponding event
                  events.push(event);
                }
              });
              completeCount++;
            } else {
              completeCount++;
            }
            if (completeCount == _.size(fileList)) {
              // all file read completed.
              events = _.sortBy(events, function (item) {
                return parseInt(item.timestamp, 10);
              });
              res.json(200, events);
            }
          });
        });
      } catch (exception) {
        console.error(exception);
        res.json(500, {
          msg: 'json parse error: ' + util.inspect(exception)
        });
      }
    }
  });
};