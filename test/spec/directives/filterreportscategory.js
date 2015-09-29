'use strict';

describe('Directive: filterReportsCategory', function () {

  // load the directive's module
  beforeEach(module('zupWebAngularApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<filter-reports-category></filter-reports-category>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the filterReportsCategory directive');
  }));
});
