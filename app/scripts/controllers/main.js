'use strict';

angular.module('zupWebAngularApp')

.controller('MainCtrl', function ($routeParams, Reports, Inventory, $rootScope) {
  var reportId = $routeParams.reportId;
  var itemId = $routeParams.itemId;

  if (typeof reportId !== 'undefined')
  {
    var reportPromise = Reports.getItems({id: reportId});

    reportPromise.$promise.then(function(response) {
      $rootScope.viewReport(response.report, response.report.category);
    });
  }

  if (typeof itemId !== 'undefined')
  {
    var itemPromise = Inventory.getItems({id: itemId, 'display_type': 'full'});

    itemPromise.$promise.then(function(response) {
      $rootScope.$watch('isLoading', function() {
        if ($rootScope.isLoading === false)
        {
          $rootScope.loadItem(response.item);
        }
      });
    });
  }
});
