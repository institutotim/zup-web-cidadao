'use strict';

angular.module('zupWebAngularApp')
  .directive('scrollTo', function () {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var idToScroll = attrs.href;
        element.on('click', function(e) {
          var $target;
          if (idToScroll) {
            $target = $(idToScroll);
          } else {
            $target = element;
          }
          $('#feedback').animate({scrollTop: $target.offset().top},'fast');
          e.preventDefault();
        });
      }
    }
  })