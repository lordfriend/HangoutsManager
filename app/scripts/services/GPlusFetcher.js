'use strict';

angular.module('HangoutsManagerApp')
  .factory('GPlusFetcher', function ($http) {
    var APIKEY = 'AIzaSyAwhMvUNXouxZR4tGGjQ316uMj4VxXpyek';
    return function (userId, success, fail) {
      $http({
        method: 'GET',
        url: 'https://www.googleapis.com/plus/v1/people/' + userId,
        params: {
          key: APIKEY
        }
      }).success(success).error(fail);
    }
  });
