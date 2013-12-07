'use strict';

describe('Directive: HangoutsAvatar', function () {

  // load the directive's module
  beforeEach(module('HangoutsManagerApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<-hangouts-avatar></-hangouts-avatar>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the HangoutsAvatar directive');
  }));
});
