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
    .when('/reports/view/:reportId', {
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
    .when('/password_reset/:token', {
      templateUrl: 'views/password_reset.html',
      controller: 'PasswordResetCtrl'
    })
    .when('/feedback/:feedbackId', {
      templateUrl: 'views/feedback.html',
      controller: 'FeedbackCtrl'
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

.run(['$rootScope', '$q', '$location', 'Auth', '$modal', 'Reports', 'Inventory', function($rootScope, $q, $location, Auth, $modal, Reports, Inventory) {
    $rootScope.$on('$routeChangeStart', function(e, curr, prev) {

    if (typeof prev === 'undefined')
    {
      $rootScope.reportCategories = {};
      $rootScope.inventoryCategories = {};
      $rootScope.statuses = [];
      $rootScope.enabledReports = true;

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

      // Get report categories
      var reportsCategories = Reports.get({'display_type': 'full'}, function(data) {
        $rootScope.reportCategories = data.categories;

        // merge all categories statuses in one array with no duplicates
        for (var i = data.categories.length - 1; i >= 0; i--) {
          for (var j = data.categories[i].statuses.length - 1; j >= 0; j--) {
            var found = false;

            for (var k = $rootScope.statuses.length - 1; k >= 0; k--) {
              if ($rootScope.statuses[k].id === data.categories[i].statuses[j].id)
              {
                found = true;
              }
            };

            if (!found)
            {
              $rootScope.statuses.push(data.categories[i].statuses[j])
            }
          };
        };

        if (data.categories.length === 0) {
          $rootScope.enabledReports = false;
        };
      });

      // Get inventory categories
      var inventoryCategories = Inventory.get({'display_type': 'full'}, function(data) {
        $rootScope.inventoryCategories = data.categories;
      });

      // Wait for all categories to load
      $q.all([reportsCategories.$promise, inventoryCategories.$promise, check.$promise]).then(function() {
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
    else if (curr.controller === 'FeedbackCtrl')
    {
      $rootScope.page = 'feedback';
    }
    else if (curr.controller === 'AccountCtrl')
    {
      $rootScope.page = 'account';
    }
  });

  // Helper
  $rootScope.getReportCategory = function(id) {
    for (var i = $rootScope.reportCategories.length - 1; i >= 0; i--) {
      if ($rootScope.reportCategories[i].id === id)
      {
        return $rootScope.reportCategories[i];
      }
    }

    return null;
  };

  // Helper
  $rootScope.getInventoryCategory = function(id) {
    for (var i = $rootScope.inventoryCategories.length - 1; i >= 0; i--) {
      if ($rootScope.inventoryCategories[i].id === id)
      {
        return $rootScope.inventoryCategories[i];
      }
    }

    return null;
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

  $rootScope.login = function(showNewReportModel, forceReload, reloginMsg) {
    $modal.open({
      templateUrl: 'views/modal_login.html',
      windowClass: 'modal_login',
      controller: ['$scope', '$route', '$rootScope', '$modalInstance', 'User', function($scope, $route, $rootScope, $modalInstance, User) {

        if (reloginMsg === true) {
          $scope.reloginmsg = 'Sua sessão expirou. Por favor, entre novamente.';
        }
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

            if (showNewReportModel === true)
            {
              $rootScope.newReport();
            }
            if (forceReload === true) {
              $route.reload();
            }
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
            Alert.show('Parabéns!', 'Sua conta foi criada com sucesso. Agora você pode criar e verificar suas solicitações.');
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
      controller: ['$scope', '$modalInstance', 'Reports', 'Alert', '$location', '$fileUploader', function($scope, $modalInstance, Reports, Alert, $location, $fileUploader) {
        $scope.inputs = {
          description: null
        };

        $scope.itemId = null;
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
              inventory_item_id: $scope.itemId,
              description: $scope.inputs.description,
              address: $scope.formattedAddress,
              images: images
            });

            newReport.$save(function(data) {
              $modalInstance.close();
              Alert.show('Relato criado com sucesso', 'Solicitação enviada com sucesso. Agora você pode visualizar o andamento da sua solicitação no menu superior.', function() {
                $location.path('/reports/view/' + data.report.id);
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

  $rootScope.termsOfUse = function () {
    $modal.open({
      templateUrl: 'views/modal_terms_of_use.html',
      windowClass: 'modal_terms_of_use',
      controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        $scope.close = function () {
          $modalInstance.close();
        };
      }]
    });
  };

    $rootScope.viewItemWithReports = function(item, category) {
    var id = item.inventory_item_id, categoryId = item.inventory_item_category_id;

    Inventory.getItem({ id: id, categoryId: categoryId }, function(data) {
      $rootScope.viewItem(data.item, $rootScope.getInventoryCategory(categoryId), true);
    });
  },

  $rootScope.viewItem = function(item, category, viewReports) {
    $modal.open({
      templateUrl: 'views/modal_view_item.html',
      windowClass: 'modal_view_item',
      resolve: {
        item: function() {
          return item;
        },

        category: function() {
          return category;
        }
      },
      controller: ['$scope', '$modalInstance', 'item', 'category', 'Reports','$interpolate', function($scope, $modalInstance, item, category, Reports, $interpolate) {
        $scope.item = item;
        $scope.category = category;
        $scope.currentTab = 0;

        if (viewReports === true)
        {
          $scope.currentTab = 1;
        }
        $scope.getDataByInventoryFieldId = function(id) {

          $scope._Index = 0;

          $scope.isActive = function (index) {
            return $scope._Index === index;
          };

          $scope.showPhoto = function (index) {
            $scope._Index = index;
          };

          for (var i = 0; i < item.data.length; i++) {
            if (item.data[i].field.id === id) {
              if (item.data[i].field.kind === 'images') {
                for (var j = item.data[i].content.length - 1; j >= 0; j--) {
                  var titulo = item.data[i].field.label;
                  item.data[i].content[j]['titulo'] = titulo;
                  $scope.galerias = item.data[i].content;
                  //var counter item.data[i].content[j].inventory_item_data_id;
                }
              } else {
                return item.data[i].content;
              }
            }
          };
        };
        $scope.loadingReports = true;

        Reports.getReportsByItem({itemId: item.id}, function(data) {
          for (var i = data.reports.length - 1; i >= 0; i--) {
            data.reports[i].category = $rootScope.getReportCategory(data.reports[i].category_id);

            for (var j = data.reports[i].category.statuses.length - 1; j >= 0; j--) {
              if (data.reports[i].category.statuses[j].id === data.reports[i].status_id)
              {
                data.reports[i].status = data.reports[i].category.statuses[j];
              }
            }
          };

          $scope.reports = data.reports;

          $scope.currentReport = data.reports[0];

          $scope.loadingReports = false;
        });

        $scope.viewReport = function(report) {
          $scope.currentReport = report;
        };

        $scope.close = function () {
          $modalInstance.close();
        };
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