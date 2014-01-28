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

.run(['$rootScope', '$location', 'Auth', '$modal', 'Reports', function($rootScope, $location, Auth, $modal, Reports) {

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

  $rootScope.categories = {};

  Reports.get(function(data) {
    $rootScope.categories = data.categories;
  });

  $rootScope.getReportCategory = function(id) {
    for (var i = $rootScope.categories.length - 1; i >= 0; i--) {
      if ($rootScope.categories[i].id === id)
      {
        return $rootScope.categories[i];
      }
    }

    return null;
  };

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

  $rootScope.newReport = function() {
    $modal.open({
      templateUrl: 'views/modal_new_report.html',
      windowClass: 'modal_new_report',
      controller: ['$scope', '$modalInstance', 'Reports', 'Alert', function($scope, $modalInstance, Reports, Alert) {

        $scope.inputs = {
          description: null
        };

        $scope.categoryData = null;
        $scope.lat = null;
        $scope.lng = null;
        $scope.formattedAddress = null;
        $scope.policy = false;

        $scope.close = function () {
          $modalInstance.close();
        };

        $scope.selectCategory = function(categoryData) {
          $scope.categoryData = categoryData;
        };

        $scope.send = function() {
          $scope.inputErrors = {};
          $scope.processingForm = true;

          var newReport = new Reports({
            categoryId: $scope.categoryData.id,
            latitude: $scope.lat,
            longitude: $scope.lng,
            description: $scope.inputs.description,
            address: $scope.formattedAddress
          });

          newReport.$save(function() {
            $modalInstance.close();
            Alert.show('Relato criado com sucesso', 'Agora você pode checar o status do seu relato no menu superior.');
          }, function(response) {
            $scope.processingForm = false;
            $scope.inputErrors = response.data.error;
          });
        };

      }]
    });
  };

  $rootScope.viewReport = function(report, category) {
    $modal.open({
      templateUrl: 'views/modal_view_report.html',
      windowClass: 'modal_view_report',
      resolve: {
        report: function() {
          return report;
        },

        category: function() {
          return category;
        }
      },
      controller: ['$scope', '$modalInstance', 'report', 'category', function($scope, $modalInstance, report, category) {
        $scope.report = report;
        $scope.category = category;

        $scope.close = function () {
          $modalInstance.close();
        };

        for (var i = category.statuses.length - 1; i >= 0; i--) {
          if (category.statuses[i].id === report.status_id)
          {
            $scope.status = category.statuses[i];
          }
        }

        console.log($scope.status);

      }]
    });
  };

  $rootScope.logout = function() {
    Auth.clearToken();
    Auth.saveUser(null);
    $rootScope.logged = false;
  };

}]);
