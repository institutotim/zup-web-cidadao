'use strict';

angular.module('zupWebAngularApp')
  .directive('filterReportsCategory', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        element.click(function() {
          // since we need to show reports, let's deactivate active items icons
          $('.inventory_category_icon').each(function() {
            var elScope = angular.element(this).scope();

            $(this).find('span.image').css('background-image', 'url(' + elScope.category.icon.retina.web.disabled + ')');
            $(this).removeClass('active');
          });

          element.toggleClass('active');
        });
      }
    };
  });
