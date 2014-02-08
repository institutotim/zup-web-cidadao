/* global $ */
'use strict';

angular.module('zupWebAngularApp')
  .directive('sliderFilter', function ($rootScope) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        $(element).slider({
            value: 1,
            min: 1,
            max: 4,
            step: 1,
            stop: function( event, ui ) {
              // From 6 months ago to today
              if (ui.value == 1)
              {
                var beginDate = new Date();
                beginDate.setHours(0, 0, 0, 0);
                beginDate = new Date(beginDate.getFullYear(), beginDate.getMonth() - 6, 1);
                beginDate = beginDate.toISOString();
              }

              // From 3 months ago to today
              if (ui.value == 2)
              {
                var beginDate = new Date();
                beginDate.setHours(0, 0, 0, 0);
                beginDate = new Date(beginDate.getFullYear(), beginDate.getMonth() - 3, 1);
                beginDate = beginDate.toISOString();
              }

              // From 1 month ago to today
              if (ui.value == 3)
              {
                var beginDate = new Date();
                beginDate.setHours(0, 0, 0, 0);
                beginDate = new Date(beginDate.getFullYear(), beginDate.getMonth() - 1, 1);
                beginDate = beginDate.toISOString();
              }

              // From 1 week ago to today
              if (ui.value == 4)
              {
                var beginDate = new Date();
                beginDate.setDate(beginDate.getDate() - 7);
                beginDate = beginDate.toISOString();
              }

              var endDate = new Date();
              endDate.setTime(endDate.getTime() + (24 * 60 * 60 * 1000));
              endDate = endDate.toISOString();

              $rootScope.itemsPeriod = {beginDate: beginDate, endDate: endDate};
              $rootScope.$apply();
            }
          });
      }
    };
  });
