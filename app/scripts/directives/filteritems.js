'use strict';

angular.module('zupWebAngularApp')
  .directive('filterItems', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var disableIcon = function() {
          element.find('span.image').css('background-image', 'url(' + scope.category.icon.retina.web.disabled + ')');
        };

        var enableIcon = function() {
          element.find('span.image').css('background-image', 'url(' + scope.category.icon.retina.web.active + ')');
        };

        element.hover(function() {
          enableIcon();
        }, function() {
          if (!element.hasClass('active'))
          {
            disableIcon();
          }
        });

        element.click(function() {
          // let's disable reports icons
          $('.report_category_icon').removeClass('active');

          element.toggleClass('active');

          if (element.hasClass('active'))
          {
            enableIcon();
          }
          else
          {
            disableIcon();
          }
        });

        // start with disabled icon
        disableIcon();
      }
    };
  });
