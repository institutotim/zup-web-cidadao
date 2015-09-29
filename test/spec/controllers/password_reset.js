'use strict';

describe('Controller: PasswordResetCtrl', function () {

  // load the controller's module
  beforeEach(module('zupWebAngularApp'));

  var PasswordResetCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PasswordResetCtrl = $controller('PasswordResetCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
