'use strict';

angular.module('HangoutsManagerApp')
  .directive('hangoutsAvatar', function () {
    return {
      scope: {avatar: "="},
      restrict: 'C',
      link: function postLink(scope, element, attrs) {
//        console.log(scope);
        if(angular.isString(scope.avatar)){
//          console.log(scope.avatar + 'is String')
          element.append('<div class="big-avatar">' +
                            '<img src="'+scope.avatar + '">' +
                        '</div>');
        } else if(angular.isArray(scope.avatar)) {
//          console.log(scope.avatar + 'is Array');
          var pos = ['tl', 'bl', 'tr', 'br'];
          if(scope.avatar.length == 2) {
            for(var i = 0; i < scope.avatar.length; i++) {
              element.append('<div class="middle-avatar">' +
                                '<img src="' + scope.avatar[i] + '">' +
                             '</div>');
            }
          } else if(scope.avatar.length == 3) {
            element.append('<div class="middle-avatar">' +
                                '<img src="' + scope.avatar[0] + '">' +
                           '</div>');
            for(var j = 1; j < 3; j++) {
              element.append('<div class="small-avatar '+ pos[j+1] +'">' +
                                '<img src="' + scope.avatar[j] + '">' +
                             '</div>');
            }
          } else if(scope.avatar.length == 4) {
            for(var k = 0; k < 4; k++) {
              element.append('<div class="small-avatar ' + pos[k] +'">' +
                                '<img src="' + scope.avatar[k] + '">' +
                             '</div>');
            }
          }

        }
      }
    };
  });
