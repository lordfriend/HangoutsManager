'use strict';

angular.module('HangoutsManagerApp', ['ngResource', 'ui.bootstrap', 'dynBootstrapSelect'])
  .config(function ($routeProvider, $httpProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/splash.html',
        controller: 'SplashCtrl'
      })
      .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    // enable CORS request.
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  });

function jqUpdateSize(){
  // Get the dimensions of the viewport
//  var width = $(window).width();
  var height = $(window).height();
  console.log('height=' + height);
  var hangoutNavHeight = height - 130;
  var chatFrameHeight = height - 230;
  $('.hangouts-nav').css('height', hangoutNavHeight + 'px');
  $('.archive-list').css('height', hangoutNavHeight + 'px');
  $('.chat-frame').css('height', chatFrameHeight + 'px');

}
$(document).ready(jqUpdateSize);    // When the page first loads
$(window).resize(jqUpdateSize);     // When the browser changes size