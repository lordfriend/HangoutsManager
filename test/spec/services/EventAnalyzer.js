'use strict';

describe('Service: Eventanalyzer', function () {

  // load the service's module
  beforeEach(module('HangoutsmanagerApp'));

  // instantiate service
  var Eventanalyzer;
  beforeEach(inject(function (_Eventanalyzer_) {
    Eventanalyzer = _Eventanalyzer_;
  }));

  it('should do something', function () {
    expect(!!Eventanalyzer).toBe(true);
  });

});
