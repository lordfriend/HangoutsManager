'use strict';

angular.module('HangoutsManagerApp')
  .controller('SettingsCtrl', function ($scope, $resource, Initialize, GPlusFetcher) {

    $scope.timezone = Initialize.timezone;
    $scope.timezoneMap = Initialize.timezoneMap;

    $scope.isProcessingData = false;
    $scope.google = Initialize.google;

    var getParticipantDetail = function (participant) {
      $scope.isProcessingData = true;
      $scope.progressMessage = {};
      var impendingTask = [];
      angular.forEach(participant, function(value, key){
        if(!value || !value.displayName) {
          impendingTask.push({id: key});
        }
      });
      var totalParticipant = impendingTask.length;
      var complete = 0;
      var execute = function(){
        if(impendingTask.length > 0) {
          var task = impendingTask.shift();
          $scope.progressMessage.event = 'Fetching participant info ' + complete + '/'+ totalParticipant;
          GPlusFetcher(task.id, function(data, status, headers, config){
            participant[task.id] = data;
            complete++;
            $scope.progressMessage.event = 'Fetching participant info ' + complete + '/'+ totalParticipant;
            $scope.progressMessage.data = 'Participant id: ' + task.id + '(' + task.fallback_name + ')';
          },function(data, status, headers, config){
            $scope.progressMessage.event = 'Fetching participant info ' + complete + '/'+ totalParticipant;
            complete++;
            $scope.progressMessage.data = 'fail...';
            console.error(data);
          });
          setTimeout(execute, 500);
        } else {
          valid();
        }
      };

      var valid = function() {
        if(complete == totalParticipant) {
          var Participant = $resource('/api/participant');
          Participant.save({participants: participant}, function(data){
            console.log(data);
          }, function(err){
            console.error(err);
          });
          $scope.isProcessingData = false;
        } else {
          setTimeout(valid, 100);
        }
      };

      setTimeout(execute, 500);
    };

    var Settings = $resource('/api/setting/:verb', {}, {
      'buildIndex': {method: 'POST', params: {verb: 'index'}, isArray: false},
      'getBuildProgress': {method: 'GET', params: {verb: 'index-progress'}, isArray: false},
      'setProxy': {method: 'POST', params: {verb: 'proxy'}, isArray: false},
      'getProxy': {method: 'GET', params: {verb: 'proxy'}, isArray: false},
      'enableProxy': {method: 'POST', params: {verb: 'enableProxy'}, isArray: false},
      'getTimezone': {method: 'GET', params: {verb: 'timezone'}, isArray: false},
      'setTimezone': {method: 'POST', params: {verb: 'timezone'}, isArray: false}
    });

    var fetchProgress = function() {
      Settings.getBuildProgress({}, function(data) {
        if(data.event == 'eventsIndex') {
          $scope.progressMessage.event = 'Saving event index of conversation#' + data.event;
          $scope.progressMessage.data = 'file: ' + data.data.fileName + '...';
        } else if(data.event == 'events'){
          $scope.progressMessage.event = 'Saving events';
          $scope.progressMessage.data = 'file: ' + data.data + '...';
        }

        if(data.event != 'end') {
          fetchProgress();
        }
      });
    };

    $scope.buildIndex = function(){
      var path = $scope.serverFilePath;
      $scope.isProcessingData = true;
      $scope.progressMessage = {};
      fetchProgress();
      Settings.buildIndex({path: path}, function(data){
        getParticipantDetail(data.participants);
      });
    };

    $scope.$watch('timezone', function(newValue, oldValue) {
      console.log('newValue: ' + newValue + '  oldValue: ' + oldValue);
      if(newValue && newValue != oldValue) {
        Initialize.timezone = newValue;
        Settings.setTimezone({timezone: newValue}, function(data) {
          console.log(data);
        });
      }
    });

    $('#dropzone').filedrop({
      fallback_id: 'upload-input',
      url: '/api/upload',
      paramname: 'userfile',
      withCredentials: false,
      maxfiles: 1,
      error: function(err, file) {
        console.log(err);
        switch(err) {
          case 'BrowserNotSupported':
            alert('browser does not support HTML5 drag and drop')
            break;
          case 'TooManyFiles':
            // user uploaded more than 'maxfiles'
            break;
          case 'FileTooLarge':
            // program encountered a file whose size is greater than 'maxfilesize'
            // FileTooLarge also has access to the file which was too large
            // use file.name to reference the filename of the culprit file
            break;
          case 'FileTypeNotAllowed':
            // The file type is not in the specified list 'allowedfiletypes'
            break;
          case 'FileExtensionNotAllowed':
            // The file extension is not in the specified list 'allowedfileextensions'
            break;
          default:
            break;
        }
      },
      allowedfiletypes: ['image/jpeg','image/png','image/gif'],   // filetypes allowed by Content-Type.  Empty array means no restrictions
      allowedfileextensions: [], // file extensions allowed. Empty array means no restrictions
      dragOver: function() {
        // user dragging files over #dropzone
        console.log('dragOver');
      },
      dragLeave: function() {
        // user dragging files out of #dropzone
      },
      docOver: function() {
        // user dragging files anywhere inside the browser document window
      },
      docLeave: function() {
        // user dragging files out of the browser document window
      },
      drop: function() {
        // user drops file
      },
      uploadStarted: function(i, file, len){
        // a file began uploading
        // i = index => 0, 1, 2, 3, 4 etc
        // file is the actual file of the index
        // len = total files user dropped
      },
      uploadFinished: function(i, file, response, time) {
        // response is the data you got back from server in JSON format.
      },
      progressUpdated: function(i, file, progress) {
        // this function is used for large files and updates intermittently
        // progress is the integer value of file being uploaded percentage to completion
      },
      globalProgressUpdated: function(progress) {
        // progress for all the files uploaded on the current instance (percentage)
        // ex: $('#progress div').width(progress+"%");
      },
      speedUpdated: function(i, file, speed) {
        // speed in kb/s
      },
      rename: function(name) {
        // name in string format
        // must return alternate name as string
      },
      beforeEach: function(file) {
        // file is a file object
        // return false to cancel upload
      },
      beforeSend: function(file, i, done) {
        // file is a file object
        // i is the file index
        // call done() to start the upload
      },
      afterAll: function() {
        // runs after all files have been uploaded or otherwise dealt with
      }

    });

  });