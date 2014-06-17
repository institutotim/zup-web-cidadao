'use strict';

angular.module('zupWebAngularApp')
  .directive('filterItems', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {

        element.click(function() {
          // let's disable reports icons
          $('.report_category_icon').removeClass('active');
          $('.inventory_category_icon').each(function() {
            $(this).removeClass('active');
          });
          element.toggleClass('active');
        });
      }
    };
  });
