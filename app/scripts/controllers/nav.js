'use strict';

angular.module('HangoutsManagerApp')
  .controller('NavCtrl', function ($scope, Initialize, $location) {
    $scope.$location = $location;
  });
