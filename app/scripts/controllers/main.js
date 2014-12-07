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
      var categoryPromise = Inventory.getCategory({id: response.item.inventory_category_id, 'display_type': 'full'});

      categoryPromise.$promise.then(function(categoryResponse) {
        $rootScope.viewItem(response.item, categoryResponse.category);
      });
    });
  }
});
