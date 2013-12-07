'use strict';

describe('Service: GPlusFetcher', function () {

  // load the service's module
  beforeEach(module('HangoutsManagerApp'));

  // instantiate service
  var GPlusFetcher;
  beforeEach(inject(function (_GPlusFetcher_) {
    GPlusFetcher = _GPlusFetcher_;
  }));

  it('should do something', function () {
    expect(!!GPlusFetcher).toBe(true);
  });

});
