'use strict';

angular.module('zupWebAngularApp')
.controller('ReportsCtrl', function ($scope, Reports, $routeParams) {
  var reportId = $routeParams.reportId;

  $scope.loadingReports = true;

  var loadComments = function(reportId) {
    //if (report.comments_count > 0)
    if (true)
    {
      $scope.loadingComments = true;

      Reports.getItems({ id: reportId, return_fields: 'comments.id,comments.message,comments.created_at' }, function(data) {
        $scope.loadingComments = false;

        $scope.comments = data.report.comments;
      });
    }
  };

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

    loadComments($scope.currentReport.id);

    $scope.loadingReports = false;
  });

  $scope.viewReport = function(report) {
    $scope.currentReport = report;
    $scope.comments = [];

    loadComments(report.id);
  };
});
