'use strict';

angular.module('zupWebAngularApp')
  .directive('reportCategoryIcon', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        element.click(function() {
          angular.element('.report_filter').removeClass('active');
          element.addClass('active');
        });
      }
    };
  });
