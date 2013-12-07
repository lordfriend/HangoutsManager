'use strict';

angular.module('HangoutsManagerApp')
  .factory('Conversation', function ($resource) {
    return $resource('/api/conversation/:conversationId/:verb',{}, {
      dateList: {method: 'GET', params: {verb: 'date-list'}, isArray: false},
      events: {method: 'POST', params: {verb: 'events', conversationId: '@id'}, isArray: true}
    });
  });
