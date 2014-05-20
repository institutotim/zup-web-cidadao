'use strict';

angular.module('zupWebAngularApp')
.controller('ReportsCtrl', function ($scope, Reports, $routeParams) {
  var reportId = $routeParams.reportId;

  $scope.loadingReports = true;
        Reports.getMyItems(function(data) {

    var reports = $scope.reports = data.reports;
    $scope.currentReport = data.reports[0];

    if (typeof reportId !== 'undefined')
    {
      for (var i = reports.length - 1; i >= 0; i--) {
        if (reports[i].id == reportId)
        {
          $scope.currentReport = reports[i];
        }
      };
    }

    $scope.loadingReports = false;
  });

  $scope.viewReport = function(report) {
    $scope.currentReport = report;
  };
});
