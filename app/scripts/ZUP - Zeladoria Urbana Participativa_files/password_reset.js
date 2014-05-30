'use strict';

angular.module('zupWebAngularApp')
  .controller('PasswordResetCtrl', function ($scope, Users, $routeParams, Alert, $location, $timeout) {
    var token = $routeParams.token;

    $scope.send = function() {
      $scope.inputErrors = {};
      $scope.processingForm = true;

      Users.resetPassword({ 'token': token, 'new_password': $scope.password, 'new_password_confirmation': $scope.password_confirmation }, function() {
        Alert.show('Senha alterada', 'Sua senha foi alterada com sucesso! Você pode agora efetuar o login com a sua nova senha.');
        $location.path('/');
      }, function(response) {
        Alert.show('Erro', 'Token ou nova senha inválida.');
      });
    };

  });
