'use strict';

angular.module('zupWebAngularApp')

.controller('AccountCtrl', ['$scope', 'Alert', 'Users', 'Reports', function ($scope, Alert, Users, Reports) {

  $scope.inputs = {};

    Reports.getMyItems(function(data) {
        $scope.reportsn = data.reports.length;
    });
    $scope.submit = function() {
    $scope.inputErrors = {};
    $scope.processingForm = true;
      console.log($scope.processingForm);
    Users.update($scope.me, function() {
      $scope.processingForm = false;
      Alert.show('Parabéns!', 'Dados atualizados com sucesso.');
    }, function(response) {
      $scope.processingForm = false;
      $scope.inputErrors = response.data.error;
    });
  };

}]);
