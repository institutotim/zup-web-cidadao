'use strict';

angular.module('zupWebAngularApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap'
])

.config(function ($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });

  $httpProvider.interceptors.push(['$q', '$injector', function($q, $injector) {
    return {
      // change URL on external requests
      'request': function(config) {
        // temparary fix -- replace with http://staging.zup.sapience.io later
        config.url = config.url.replace('{base_url}', 'http://staging.zup.sapience.io');

        // get token and pass to the server with header X-App-Token
        var token = null;

        $injector.invoke(['Auth', function(Auth) {
          token = Auth.getToken();
        }]);

        config.headers['X-App-Token'] = token;

        // apply all the changes! :)
        return config || $q.when(config);
      },

      // check for expected errors
      // if not, show generic system error
      'responseError': function(rejection) {

        var expectedErrors = rejection.config.expectedErrors;

        if (!(typeof expectedErrors !== 'undefined' && expectedErrors.indexOf(rejection.status) !== -1))
        {
          $injector.invoke(['Error', function(Error) {
            Error.showDetails(rejection);
          }]);
        }

        return $q.reject(rejection);
      }
    };
  }]);

  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
})

.run(['$rootScope', '$location', 'Auth', '$modal', function($rootScope, $location, Auth, $modal) {

  $rootScope.$on('$routeChangeStart', function(e, curr, prev) {
    if (typeof prev === 'undefined')
    {
      $rootScope.isLoading = true;
    }

    // Check if user has a cookie with token
    var check = Auth.check();

    check.then(function() {
      // onSuccess
      $rootScope.isLoading = false;
      $rootScope.logged = true;
    }, function() {
      $rootScope.isLoading = false;
      $rootScope.false = true;
    });
  });

  $rootScope.login = function() {
    $modal.open({
      templateUrl: 'views/modal_login.html',
      windowClass: 'modal_login',
      controller: ['$scope', '$rootScope', '$modalInstance', 'User', function($scope, $rootScope, $modalInstance, User) {

        $scope.inputs = {};

        $scope.close = function() {
          $modalInstance.close();
        };

        $scope.signup = function() {
          $modalInstance.close();
          $rootScope.signup();
        };

        $scope.login = function() {
          $scope.loginError = false;

          var user = new User($scope.inputs.email, $scope.inputs.password);

          user.auth().then(function() {
            $rootScope.logged = true;
            $modalInstance.close();
          }, function(response) {
            if (response.status === 400 || response.status === 401)
            {
              $scope.loginError = true;
            }
          });
        };
      }]
    });
  };

  $rootScope.signup = function() {
    $modal.open({
      templateUrl: 'views/modal_signup.html',
      windowClass: 'modal_signup',
      controller: ['$scope', '$modalInstance', 'Users', 'Alert', function($scope, $modalInstance, Users, Alert) {

        $scope.inputs = {};

        $scope.close = function () {
          $modalInstance.close();
        };

        $scope.register = function() {

          $scope.inputErrors = {};
          $scope.processingForm = true;

          var newUser = new Users($scope.inputs);

          newUser.$save(function() {
            $modalInstance.close();
            Alert.show('Parabéns!', 'Sua conta foi criada com sucesso. Agora você pode efetuar solicitações de limpeza de boca de lobo e para coletas de entulho.');
          }, function(response) {
            $scope.processingForm = false;
            $scope.inputErrors = response.data.error;
          });

        };
      }]
    });
  };

  $rootScope.logout = function() {
    Auth.clearToken();
    Auth.saveUser(null);
    $rootScope.logged = false;
  };

}]);
