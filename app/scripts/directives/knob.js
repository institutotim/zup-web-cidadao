'use strict';

angular.module('zupWebAngularApp')
  .directive('knob', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        element.knob({
          'width': 80,
          'height': 80,
          'bgColor': '#eaeaea',
          'thickness': '.21',
          'readOnly': true,
          'fontWeight': '700',
          'inputColor': '#b2b2b2',
          'fgColor': scope.status.color,
          'value': 30
        });

        scope.$watch('status.percentage', function() {
          element.val(scope.status.percentage).trigger('change');
        });
      }
    };
  });
