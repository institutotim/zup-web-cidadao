'use strict';

angular.module('zupWebAngularApp')
  .directive('knob', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        element.knob();
      }
    };
  });
