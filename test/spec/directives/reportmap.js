'use strict';

describe('Directive: reportMap', function () {

  // load the directive's module
  beforeEach(module('zupWebAngularApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<report-map></report-map>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the reportMap directive');
  }));
});
