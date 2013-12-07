'use strict';

describe('Service: conversation', function () {

  // load the service's module
  beforeEach(module('HangoutsManagerApp'));

  // instantiate service
  var conversation;
  beforeEach(inject(function (_conversation_) {
    conversation = _conversation_;
  }));

  it('should do something', function () {
    expect(!!conversation).toBe(true);
  });

});
