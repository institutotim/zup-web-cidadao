'use strict';

angular.module('zupWebAngularApp')
.directive('spinnerOnLoad', function() {
  return {
    restrict: 'A',
    link: function(scope,element){
      element.on('load', function() {
        $('.loader').find('span').fadeOut('fast');
      });
      scope.$watch('ngSrc', function() {
        $('.loader').append('<span class="spinner"><img src="/images/loading.gif" width="20" height="20"></span>');
        $('.carousel').find('.carousel-control').fadeIn('slow');
        setTimeout(function (){
          $('.carousel-inner .item').find('span').fadeIn('fast');
        }, 750);
      });
    }
  }
});