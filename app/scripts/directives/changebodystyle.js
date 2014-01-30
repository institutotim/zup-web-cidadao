'use strict';

angular.module('zupWebAngularApp')
  .directive('changeBodyStyle', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        scope.$watch('page', function() {
          if (scope.page === 'account')
          {
            element.addClass('account');
          }
          else
          {
            element.removeClass('account');
          }
        });
      }
    };
  });
