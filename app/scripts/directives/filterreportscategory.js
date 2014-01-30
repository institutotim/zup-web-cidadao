'use strict';

angular.module('zupWebAngularApp')
  .directive('filterReportsCategory', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        element.click(function() {
          element.toggleClass('active');
        });
      }
    };
  });
