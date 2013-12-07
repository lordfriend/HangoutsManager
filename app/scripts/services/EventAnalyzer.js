'use strict';

angular.module('HangoutsManagerApp')
  .service('Eventanalyzer', function Eventanalyzer() {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var ONE_MONTH_ARCHIVE = 0;
    var MULTI_MONTH_ARCHIVE = 1;

    var self = this;
    self.eventIds = [];
    self.archive = [];
    self.setEventIds = function(eventIds) {
      self.eventIds = eventIds;
    };

    self.expandArchive = function(archive) {
      self.archive = archive;
      var dailyArchive = [];
      if(self.eventIds.length == 1) {
        dailyArchive.push({
          day: moment(self.eventIds[0].timestamp/1000).format('Do, MMM'),
          dayOfWeek: moment(self.eventIds[0].timestamp/1000).format('d'),
          event_range: [self.eventIds[0], self.eventIds[1]]
        });
        return dailyArchive;
      }
      var lastDayEndPoint = 0;
      var archiveType = ONE_MONTH_ARCHIVE;
      if(!moment(archive.event_range[0].timestamp/1000).isSame(moment(archive.event_range[1].timestamp/1000),'month')){
        archiveType = MULTI_MONTH_ARCHIVE;
      }
      for(var i = 0; i < self.eventIds.length; i++) {
        if(self.eventIds[i].timestamp >= self.archive.event_range[0].timestamp && self.eventIds[i].timestamp <= self.archive.event_range[1].timestamp) {
          // this eventId is between target archive's event_range.
          var event_time = self.eventIds[i].timestamp /1000;
          if(event_time <= lastDayEndPoint) {
            // this event is fall into the same range of the last day.
            dailyArchive[dailyArchive.length - 1].event_range[1] = self.eventIds[i];
          } else {
            var event_moment = moment(self.eventIds[i].timestamp/1000);
            var dayDisplay, dayOfWeekDisplay;
            if(archiveType == ONE_MONTH_ARCHIVE) {
              dayDisplay = event_moment.format('Do');
              dayOfWeekDisplay = event_moment.format('d');
            } else {
              dayDisplay = event_moment.format('Do, MMM');
              dayOfWeekDisplay = event_moment.format('d');
            }
            dailyArchive.push({
              day: dayDisplay,
              dayOfWeek: dayOfWeekDisplay,
              event_range:[self.eventIds[i], {timestamp: 0}]
            });
            lastDayEndPoint = event_moment.endOf('day').valueOf();
          }

        }
      }
      return dailyArchive;
    };
  });