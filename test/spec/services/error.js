'use strict';

describe('Service: Error', function () {

  // load the service's module
  beforeEach(module('zupWebAngularApp'));

  // instantiate service
  var Error;
  beforeEach(inject(function (_Error_) {
    Error = _Error_;
  }));

  it('should do something', function () {
    expect(!!Error).toBe(true);
  });

});
