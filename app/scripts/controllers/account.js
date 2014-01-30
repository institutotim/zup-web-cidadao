'use strict';

angular.module('zupWebAngularApp')

.controller('AccountCtrl', function ($scope, Alert, Users) {

  $scope.inputs = {};

  $scope.submit = function() {
    $scope.inputErrors = {};
    $scope.processingForm = true;

    Users.update($scope.me, function() {
      $scope.processingForm = false;
      Alert.show('Parabéns!', 'Sua conta foi criada com sucesso. Agora você pode efetuar solicitações de limpeza de boca de lobo e para coletas de entulho.');
    }, function(response) {
      $scope.processingForm = false;
      $scope.inputErrors = response.data.error;
    });
  };

});
