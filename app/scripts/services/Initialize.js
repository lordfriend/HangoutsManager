'use strict';

angular.module('HangoutsManagerApp')
  .service('Initialize', function Initialize($resource, $location) {
    var self = this;
    var Index = $resource('/api/index');
    self.index = Index.query({}, function(){
      if($location.path() === '/') {
        $location.path('/home').replace();
      }
//      console.log( self.index);

    }, function(error){
      console.error(error.status);
      $location.path('/settings').replace();
    });

    var Participant = $resource('/api/participant', {}, {
      query: {method: 'GET', isArray: false}
    });
    self.participant = Participant.query({}, function(data){
//      self.participant = data;
//      console.log(data);
    }, function(error){
      console.error(error);
    });

    var GoogleClient = $resource('/api/google');
    self.google = GoogleClient.query({}, function(){
//      console.log(self.google);
    }, function(error){
      console.error(error);
    });

    var getTimezone = $resource('/api/setting/timezone', {}, {
      query: {method: 'GET', isArray: false}
    });
    getTimezone.query({}, function(data) {
      if(!data.timezone) {
        var systemTimezone = moment().zone() / 60;
        var symbol = systemTimezone >= 0 ? '+': '-';
        if(Math.abs(systemTimezone) < 10) {
          systemTimezone = symbol + '0' + Math.abs(systemTimezone) + ':00';
        } else {
          systemTimezone = symbol + Math.abs(systemTimezone) + ':00';
        }
        self.timezone = systemTimezone;
      } else {
        self.timezone = data.timezone;
      }

      self.timezoneMap = data.timezone_map;
    });

  });
