'use strict';

angular.module('HangoutsManagerApp')
  .directive('ngDebug', function ($parse) {
    return {
      scope: false,
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var debugVar =  $parse(attrs.ngDebug);
        scope.$watch(function(){
          if(debugVar(scope)){
            console.log(debugVar(scope));
          }
        });
      }
    };
  });
