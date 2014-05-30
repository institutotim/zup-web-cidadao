'use strict';

angular.module('zupWebAngularApp')

.factory('Error', function ($modal) {

  return {
    // Show a pretty modal with debug information about the error
    showDetails: function (response) {

      $modal.open({
        templateUrl: 'views/modal_error.html',
        resolve: {
          response: function() {
            return response;
          }
        },
        controller: ['$scope', '$modalInstance', 'response',  function($scope, $modalInstance, response) {
          $scope.response = response;

          $scope.ok = function () {
            window.location.reload();
          };
        }]
      });
    }
  };

});
