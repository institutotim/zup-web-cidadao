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
    .when('/statistics', {
      templateUrl: 'views/statistics.html',
      controller: 'StatisticsCtrl'
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

      // Get stats
      var reportsStats = Reports.getStats(function(data) {
        $rootScope.stats = data.stats;
      });

      // Wait for all categories to load
      $q.all([reportsCategories.$promise, check.$promise, reportsStats.$promise]).then(function() {
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
    else if (curr.controller === 'StatisticsCtrl')
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

    // Start map with first filter
    $rootScope.itemsPeriod = $rootScope.getItemsPeriodBySliderPosition(1);
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

  // helper to get beginDate and endDate by the slider position
  // Current possible positions: [1, 2, 3, 4]
  $rootScope.getItemsPeriodBySliderPosition = function(pos) {
    // From 6 months ago to today
    if (pos == 1)
    {
      var beginDate = new Date();
      beginDate.setHours(0, 0, 0, 0);
      beginDate = new Date(beginDate.getFullYear(), beginDate.getMonth() - 6, 1);
      beginDate = beginDate.toISOString();
    }

    // From 3 months ago to today
    if (pos == 2)
    {
      var beginDate = new Date();
      beginDate.setHours(0, 0, 0, 0);
      beginDate = new Date(beginDate.getFullYear(), beginDate.getMonth() - 3, 1);
      beginDate = beginDate.toISOString();
    }

    // From 1 month ago to today
    if (pos == 3)
    {
      var beginDate = new Date();
      beginDate.setHours(0, 0, 0, 0);
      beginDate = new Date(beginDate.getFullYear(), beginDate.getMonth() - 1, 1);
      beginDate = beginDate.toISOString();
    }

    // From 1 week ago to today
    if (pos == 4)
    {
      var beginDate = new Date();
      beginDate.setDate(beginDate.getDate() - 7);
      beginDate = beginDate.toISOString();
    }

    var endDate = new Date();
    endDate.setTime(endDate.getTime() + (24 * 60 * 60 * 1000));
    endDate = endDate.toISOString();

    return {beginDate: beginDate, endDate: endDate};
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
      controller: ['$scope', '$modalInstance', 'Reports', 'Alert', '$route', '$fileUploader', function($scope, $modalInstance, Reports, Alert, $route, $fileUploader) {
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

        var uploader = $scope.uploader = $fileUploader.create({
          scope: $scope
        });

        // Images only
        uploader.filters.push(function(item /*{File|HTMLInputElement}*/) {
          var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
          type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        });

        $scope.send = function() {
          $scope.inputErrors = {};
          $scope.processingForm = true;
          var images = [], promises = [];

          // Add images to queue for processing it's dataUrl
          function addAsync(file) {
            var deferred = $q.defer();

            var file = file, picReader = new FileReader();

            picReader.addEventListener('load', function(event) {
              var picFile = event.target;

              images.push(picFile.result.replace(/^data:image\/[^;]+;base64,/, ''));
              deferred.resolve();
            });

            // pass as base64 and strip data:image
            picReader.readAsDataURL(file);

            return deferred.promise;
          };

          for (var i = uploader.queue.length - 1; i >= 0; i--) {
            promises.push(addAsync(uploader.queue[i].file));
          };

          // Wait for all promises to be resolved to send request
          $q.all(promises).then(function() {
            var newReport = new Reports({
              categoryId: $scope.categoryData.id,
              latitude: $scope.lat,
              longitude: $scope.lng,
              description: $scope.inputs.description,
              address: $scope.formattedAddress,
              images: images
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
