'use strict';

describe('Service: Initialize', function () {

  // load the service's module
  beforeEach(module('HangoutsManagerApp'));

  // instantiate service
  var Initialize;
  beforeEach(inject(function (_Initialize_) {
    Initialize = _Initialize_;
  }));

  it('should do something', function () {
    expect(!!Initialize).toBe(true);
  });

});
