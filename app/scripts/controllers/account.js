'use strict';

angular.module('zupWebAngularApp')

.controller('AccountCtrl', function ($scope, Alert, Users) {

  $scope.inputs = {};

  $scope.submit = function() {
    $scope.inputErrors = {};
    $scope.processingForm = true;

    Users.update($scope.me, function() {
      $scope.processingForm = false;
      Alert.show('Parabéns!', 'Dados atualizados com sucesso.');
    }, function(response) {
      $scope.processingForm = false;
      $scope.inputErrors = response.data.error;
    });
  };

});
