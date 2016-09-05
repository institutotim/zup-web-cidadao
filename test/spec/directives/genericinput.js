'use strict';

describe('Directive: genericInput', function () {

  // load the directive's module
  beforeEach(module('zupWebAngularApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<generic-input></generic-input>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the genericInput directive');
  }));
});
