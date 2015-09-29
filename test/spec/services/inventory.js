'use strict';

describe('Service: Inventory', function () {

  // load the service's module
  beforeEach(module('zupWebAngularApp'));

  // instantiate service
  var Inventory;
  beforeEach(inject(function (_Inventory_) {
    Inventory = _Inventory_;
  }));

  it('should do something', function () {
    expect(!!Inventory).toBe(true);
  });

});
