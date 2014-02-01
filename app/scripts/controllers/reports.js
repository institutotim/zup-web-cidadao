'use strict';

angular.module('zupWebAngularApp')
.controller('ReportsCtrl', function ($scope, Reports) {
  $scope.loadingReports = true;

  Reports.getMyItems(function(data) {
    $scope.reports = data.reports;

    $scope.currentReport = data.reports[0];

    $scope.loadingReports = false;
  });

  $scope.viewReport = function(report) {
    $scope.currentReport = report;
  };
});
