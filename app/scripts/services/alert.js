'use strict';

angular.module('zupWebAngularApp')

.factory('Alert', function ($modal) {

  return {
    // Show a pretty modal with debug information about the error
    show: function (title, message) {

      $modal.open({
        templateUrl: 'views/modal_alert.html',
        windowClass: 'modal_alert',
        resolve: {
          text: function() {
            return {title: title, message: message};
          }
        },
        controller: ['$scope', '$modalInstance', 'text', function($scope, $modalInstance, text) {
          $scope.title = text.title;
          $scope.message = text.message;

          $scope.ok = function () {
            $modalInstance.close();
          };
        }]
      });
    }
  };

});
