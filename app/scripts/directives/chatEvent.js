'use strict';

angular.module('HangoutsManagerApp')
  .directive('chatEvent', function ($parse) {
    return {
      templateUrl: 'views/chat-event-message-template.html',
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var eventModel = $parse(attrs.chatEvent);
        scope.$watch(function(){
          var event = eventModel(scope);
          if(angular.isObject(event)) {

            if(angular.isObject(event.conversation_rename) && !$(element).data('chat')) {
//              console.log(event.conversation_rename);
              $(element).children().not('.conversation-rename').remove();
              $(element).data('chat', true);
            } else if(angular.isObject(event.membership_change) && !$(element).data('chat')) {
              console.log(event.membership_change);
              $(element).children().not('.membership-change').remove();
              $(element).data('chat', true);
              var membershipChangeElement = $(element).children('.membership-change');
              var participant;
              var participants;
              if(event.membership_change.type == 'JOIN') {
                participant = event.membership_change.participant_id;
                if(event.sender_id.gaia_id == participant[0].gaia_id){
                  membershipChangeElement.append('<span> has joined this conversation.</span>');
                } else {
                  membershipChangeElement.append('<span> adds </span>');
                  participants = [];
                  for(var i = 0 ; i < participant.length; i++) {
                    participants.push(scope.getParticipantName(participant[i].gaia_id, true));
                  }
                  membershipChangeElement.append('<span>' + participants.join(', ') + ' to this conversation.</span>');
                }
              } else {
                participant = event.membership_change.participant_id;
                if(participant[0].gaia == event.sender_id.gaia_id) {
                  membershipChangeElement.append('<span> leaves this conversation.</span>');
                } else {
                  membershipChangeElement.append('<span> removes </span>');
                  participants = [];
                  for(var i = 0 ; i < participant.length; i++) {
                    participants.push(scope.getParticipantName(participant[i].gaia_id, true));
                  }
                  membershipChangeElement.append('<span>' + participants.join(', ') + ' from this conversation.</span>');
                }
              }
            } else if(angular.isObject(event.hangout_event) && !$(element).data('chat')) {
//              console.log(event.hangout_event);
              $(element).children().not('.hangout-event').remove();
              $(element).data('chat', true);
              var hangoutEventElement = $(element).children('.hangout-event');
              if(event.hangout_event.event_type == 'START_HANGOUT') {
                hangoutEventElement.append('<span> starts a hangout</span>');
              } else {
                hangoutEventElement.append('<span> leaves a hangout</span>')
              }
            } else if(angular.isObject(event.chat_message) && !$(element).data('chat')) {
//              console.log(event.chat_message);
              $(element).children().not('.chat-event').remove();
              $(element).data('chat', true);
            }
          }
        });
      }
    };
  });
