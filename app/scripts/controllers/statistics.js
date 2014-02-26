'use strict';

angular.module('zupWebAngularApp')
  .controller('StatisticsCtrl', function ($scope, $rootScope, Reports) {

    var statisticsProvider = {
      statuses: [],
      beginDate: null,
      endDate: null,
      totalCount: 0,

      start: function() {
        var period = $rootScope.getItemsPeriodBySliderPosition(1);

        this.beginDate = period.beginDate;
        this.endDate = period.endDate;

        this.getStats();
      },

      getStats: function() {
        $rootScope.isLoading = true;

        var params = {
          'begin_date': statisticsProvider.beginDate,
          'end_date': statisticsProvider.endDate
        };

        Reports.getStats(params, function(data) {
          statisticsProvider.organizeData(data.stats);

          $rootScope.isLoading = false;
        });
      },

      organizeData: function(stats) {
        statisticsProvider.statuses = [];
        statisticsProvider.totalCount = 0;

        // merge all categories statuses in one array with no duplicates
        for (var i = stats.length - 1; i >= 0; i--) {
          for (var j = stats[i].statuses.length - 1; j >= 0; j--) {
            var found = false;

            for (var k = statisticsProvider.statuses.length - 1; k >= 0; k--) {
              if (statisticsProvider.statuses[k].status_id === stats[i].statuses[j].status_id)
              {
                found = true;

                // add up count
                statisticsProvider.statuses[k].count += stats[i].statuses[j].count;
              }
            };

            if (!found)
            {
              statisticsProvider.totalCount += stats[i].statuses[j].count;
              stats[i].statuses[j].percentage = 100 * stats[i].statuses[j].count / statisticsProvider.totalCount;

              statisticsProvider.statuses.push(stats[i].statuses[j])
            }
          };
        };

        $scope.statuses = this.statuses;
      },

      filterReportsByPeriod: function(period) {
        statisticsProvider.beginDate = period.beginDate;
        statisticsProvider.endDate = period.endDate;

        statisticsProvider.getStats();
      },
    };

    $scope.filterReportsByPeriod = statisticsProvider.filterReportsByPeriod;

    statisticsProvider.start();

  });
