/* jshint camelcase: false */
'use strict';

angular.module('zupWebAngularApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'ui.mask',
  'angularFileUpload'
])

.config(function ($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/reports', {
      templateUrl: 'views/reports.html',
      controller: 'ReportsCtrl',
      access: { logged: true }
    })
    .when('/account', {
      templateUrl: 'views/account.html',
      controller: 'AccountCtrl',
      access: { logged: true }
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

.run(['$rootScope', '$q', '$location', 'Auth', '$modal', 'Reports', function($rootScope, $q, $location, Auth, $modal, Reports) {

  $rootScope.$on('$routeChangeStart', function(e, curr, prev) {

    if (typeof prev === 'undefined')
    {
     // Save references of our markers in $rootScope
      $rootScope.markers = {
        reports: {},
        items: {}
      };

      $rootScope.categories = {};

      $rootScope.isLoading = true;

      // Check if user has a cookie with token
      var check = Auth.check();

      // Mark user as logged
      check.then(function() {
        $rootScope.logged = true;
      }, function() {
        $rootScope.logged = false;

        if (typeof curr.access !== 'undefined' && curr.access.logged === true)
        {
          $location.path('/');
        }
      });

      // Get categories
      var reportsCategories = Reports.get(function(data) {
        $rootScope.categories = data.categories;
      });

      // Wait for all categories to load
      $q.all([reportsCategories.$promise, check.$promise]).then(function() {
        // Create objects in the markers array for each report category
        for (var i = $rootScope.categories.length - 1; i >= 0; i--) {
          $rootScope.markers.reports[$rootScope.categories[i].id] = {};
        }

        $rootScope.isLoading = false;
      });
    }

    if (curr.controller === 'MainCtrl')
    {
      $rootScope.page = 'main';
    }
    else if (curr.controller === 'ReportsCtrl')
    {
      $rootScope.page = 'reports';
    }
    else if (curr.controller === 'AccountCtrl')
    {
      $rootScope.page = 'account';
    }
  });

  // Helper
  $rootScope.getReportCategory = function(id) {
    for (var i = $rootScope.categories.length - 1; i >= 0; i--) {
      if ($rootScope.categories[i].id === id)
      {
        return $rootScope.categories[i];
      }
    }

    return null;
  };

  $rootScope.filterByReportCategory = function(category) {
    for (var categoryId in $rootScope.markers.reports)
    {
      if (parseInt(categoryId) === category.id)
      {
        angular.forEach($rootScope.markers.reports[categoryId], function(value, key){
          if (value.getVisible() === true)
          {
            value.setVisible(false);
          }
          else
          {
            value.setVisible(true);
          }
        });
      }
    }
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

        $scope.forgot = function() {
          $modalInstance.close();
          $rootScope.forgot();
        };
      }]
    });
  };

  $rootScope.forgot = function() {
    $modal.open({
      templateUrl: 'views/modal_forgot_password.html',
      windowClass: 'modal_forgot',
      controller: ['$scope', '$modalInstance', 'Users', 'Alert', function($scope, $modalInstance, Users, Alert) {

        $scope.inputs = {};

        $scope.close = function () {
          $modalInstance.close();
        };

        $scope.send = function() {

          $scope.inputErrors = {};
          $scope.processingForm = true;

          Users.recoverPassword({ 'email': $scope.inputs.email }, function() {
            $modalInstance.close();
            Alert.show('E-mail enviado', 'Um e-mail foi enviado a você com instruções para redefinir a sua senha.');
          }, function(response) {
            $scope.processingForm = false;
            $scope.inputErrors = response.data.error;
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
      controller: ['$scope', '$modalInstance', 'Reports', 'Alert', '$route', '$upload', function($scope, $modalInstance, Reports, Alert, $route, $upload) {

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

        $scope.onFileSelect = function($files) {
          //$files: an array of files selected, each file has name, size, and type.
          for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            $scope.upload = $upload.upload({
              url: 'server/upload/url', //upload.php script, node.js route, or servlet url
              // method: POST or PUT,
              // headers: {'headerKey': 'headerValue'},
              // withCredential: true,
              data: {myObj: $scope.myModelObj},
              file: file,
              // file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
              /* set file formData name for 'Content-Desposition' header. Default: 'file' */
              //fileFormDataName: myFile, //OR for HTML5 multiple upload only a list: ['name1', 'name2', ...]
              /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
              //formDataAppender: function(formData, key, val){}
            }).progress(function(evt) {
              console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
              // file is uploaded successfully
              console.log(data);
            });
            //.error(...)
            //.then(success, error, progress);
          }
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
            Alert.show('Relato criado com sucesso', 'Agora você pode checar o status do seu relato no menu superior.', function() {
              $route.reload();
            });
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
      }]
    });
  };

  $rootScope.logout = function() {
    Auth.clearToken();
    Auth.saveUser(null);
    $rootScope.logged = false;
    $location.path('/');
  };

}]);
