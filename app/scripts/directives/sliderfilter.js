/* global $ */
'use strict';

angular.module('zupWebAngularApp')
  .directive('sliderFilter', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        $(element).slider({
          value: 1,
          min: 1,
          max: 4,
          step: 1,
          stop: function( event, ui ) {
            scope.filterReportsByPeriod(scope.getItemsPeriodBySliderPosition(ui.value));
          }
        });
      }
    };
  });
