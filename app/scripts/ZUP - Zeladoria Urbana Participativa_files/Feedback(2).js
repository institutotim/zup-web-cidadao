'use strict';

angular.module('zupWebAngularApp')
  .directive('scrollTo', function () {
    return {
      restrict: 'A',
      link: function(scope, $elm, attrs) {
        var idToScroll = attrs.href;
        $elm.on('click', function(e) {
          var $target;
          if (idToScroll) {
            $target = $(idToScroll);
          } else {
            $target = $elm;
          }
          $('#feedback').animate({scrollTop: $target.offset().top},'fast');
          e.preventDefault();
        });
      }
    }
  });