'use strict';

angular.module('HangoutsManagerApp')
  .controller('HomeCtrl', function ($scope, Initialize, Conversation, Eventanalyzer, $timeout) {
    $scope.owner = null;
    $scope.conversations = Initialize.index.sort(function(c1, c2){
      return c2.eventCount - c1.eventCount;
    });
//    $scope.participant = Initialize.participant;
//    Eventanalyzer.eventIds = null;

    $scope.itemsPerPage =  10;

    /*
     *  Find out the owner's id
     */
    var occur = [];
    angular.forEach(Initialize.participant, function(value, key){
      occur.push({id: key, count: 0});
    });
    for(var i = 0; i < $scope.conversations.length; i++) {
      var participant_data = $scope.conversations[i].participant_data;
      for(var j = 0; j < participant_data.length; j++) {
        for(var k = 0; k < occur.length; k++) {
          if(occur[k].id == participant_data[j].id.gaia_id) {
            occur[k].count++;
            break;
          }
        }
      }
    }
    occur.sort(function(o1, o2){
      return o2.count - o1.count;
    });
    $scope.owner = occur[0].id;
    console.log('owner:' + $scope.owner);

    /*
     * add avatar information to conversation
     */
    for(i = 0; i < $scope.conversations.length; i++) {
      var id;
      if($scope.conversations[i].type == 'STICKY_ONE_TO_ONE') {
        for(j = 0; j < $scope.conversations[i].participant_data.length; j++) {
          id = $scope.conversations[i].participant_data[j].id.gaia_id;
          if(id != $scope.owner) {
            if(!Initialize.participant[id].displayName) {
              $scope.conversations.splice(i, 1);
              i--;
              break;
            } else {
              $scope.conversations[i].name = Initialize.participant[id].displayName;
//              console.log(Initialize.participant[id]);
              $scope.conversations[i].avatar = Initialize.participant[id].image.url;
            }
          }
        }
      } else {
        $scope.conversations[i].avatar = [];
        for(j = 0; j < $scope.conversations[i].participant_data.length && j < 4; j++) {
          id = $scope.conversations[i].participant_data[j].id.gaia_id;
          if(id != $scope.owner && Initialize.participant[id].image) {
            $scope.conversations[i].avatar.push(Initialize.participant[id].image.url);
          }
        }
        if($scope.conversations[i].avatar.length ==0) {
          $scope.conversations.splice(i, 1);
          i--;
        }
      }
    }


    $scope.onClickConversation = function(conversation) {
      $scope.currentConversation  = conversation;
      $scope.currentArchive = null;
      $scope.expanded = null;
      $scope.currentDay = null;
      Conversation.dateList({conversationId: conversation.id}, function(data){
        console.log(data);
        Eventanalyzer.setEventIds(data.eventIds);
        $scope.archives = data.archive;

      });
    };

    $scope.onClickArchive = function(archive) {
      $scope.currentDay = null;
      $scope.currentArchive = archive;

      if($scope.expanded == archive.month) {
        $scope.expanded = null;
      } else {
        $scope.expanded = archive.month;
      }
      $scope.dailyArchive = Eventanalyzer.expandArchive(archive);

      var pickedIds = [];
      var firstIndex = -1;
      for(var i = 0; i < Eventanalyzer.eventIds.length; i++) {
        if(archive.event_range[0].timestamp <= Eventanalyzer.eventIds[i].timestamp &&firstIndex < 0) {
          firstIndex = i;
          break;
        }

      }
      console.log('firstIndex:' + firstIndex);
      $scope.currentPage = firstIndex / $scope.itemsPerPage + 1;

      var firstIndexOfCurrentPage = ($scope.currentPage - 1) * $scope.itemsPerPage;
      for(var j = firstIndexOfCurrentPage; j < Eventanalyzer.eventIds.length && j <firstIndexOfCurrentPage + $scope.itemsPerPage; j++) {
        pickedIds.push(Eventanalyzer.eventIds[j].event_id);
      }

      Conversation.events({id: $scope.currentConversation.id, eventIds: pickedIds}, function(data) {
//        console.log(data);
        $scope.events = data;
      });
    };


    $scope.onClickDaily = function(daily, archive) {
      $scope.currentArchive = archive;
      $scope.currentDay = daily;
      var pickedIds = [];
      var firstIndex = -1;
      for(var i = 0; i < Eventanalyzer.eventIds.length; i++) {
        if(daily.event_range[0].timestamp <= Eventanalyzer.eventIds[i].timestamp &&firstIndex < 0) {
          firstIndex = i;
          break;
        }

      }
      console.log('firstIndex:' + firstIndex);
      $scope.currentPage = firstIndex / $scope.itemsPerPage + 1;

      var firstIndexOfCurrentPage = ($scope.currentPage - 1) * $scope.itemsPerPage;
      for(var j = firstIndexOfCurrentPage; j < Eventanalyzer.eventIds.length && j <firstIndexOfCurrentPage + $scope.itemsPerPage; j++) {
        pickedIds.push(Eventanalyzer.eventIds[j].event_id);
      }

      Conversation.events({id: $scope.currentConversation.id, eventIds: pickedIds}, function(data) {
//        console.log(data);
        $scope.events = data;
      });
    };

    $scope.getParticipantUrl = function(id) {
      return Initialize.participant[id].url;
    };

    $scope.getParticipantAvatar = function(id) {
      return Initialize.participant[id].image.url;
    };

    $scope.getMessageTime = function(timestamp) {
      timestamp = parseInt(timestamp, 10);
      return moment(timestamp/1000).format('YYYY-M-D H:m:s');
    };

    $scope.getParticipantName = function(id, displayName) {
      if(!!displayName || !Initialize.participant[id].name) {
        return Initialize.participant[id].displayName;
      } else {
        return Initialize.participant[id].name.givenName;
      }

    };

    $scope.$watch('currentPage', function(newValue, oldValue){
      console.log('currentPage:' +newValue + ' oldValue:' + oldValue);
      if(oldValue >=0) {
        var firstIndex = (newValue - 1)* $scope.itemsPerPage;
        var pickedIds = [];
        for(var i = firstIndex; i < Eventanalyzer.eventIds.length && i < firstIndex + $scope.itemsPerPage; i++) {
          pickedIds.push(Eventanalyzer.eventIds[i].event_id);
        }
        if(pickedIds.length == 0) {
          return;
        }
        console.log('firstIndex: ' + firstIndex + ' lastIndex: '+i);
        Conversation.events({id: $scope.currentConversation.id, eventIds: pickedIds}, function(data) {
          console.log(data);
          $scope.events = data;
        });
      }

    });

    $scope.onPageSelect = function(pageNum) {
      $scope.currentPage = pageNum;
      console.log('page:' + pageNum);
    };

    $scope.getJson = function(obj) {
      return angular.toJson(obj, true);
    };

  });
