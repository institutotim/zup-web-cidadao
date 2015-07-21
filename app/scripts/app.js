/* jshint camelcase: false */
'use strict';

angular.module('zupWebAngularApp', [
  'config',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'ui.mask',
  'angularFileUpload'
])

.config(function ($routeProvider, $httpProvider, ENV) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/report/:reportId', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/item/:itemId', {
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
        config.url = config.url.replace('{base_url}', ENV.apiEndpoint);

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

.run(['$rootScope', '$q', '$location', 'Auth', '$modal', 'Reports', 'Inventory', 'Flags', function($rootScope, $q, $location, Auth, $modal, Reports, Inventory, Flags) {
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

        if(data.categories && data.categories.length > 0) {
          $rootScope.enabledInventory = true;
        }
      });

      var flags = Flags.getAll();

      flags.$promise.then(function(response) {
        $rootScope.featureFlags = response.flags;
      });

      $rootScope.isFeatureEnabled = function(feature) {
        if (typeof $rootScope.featureFlags === 'undefined') return false;

        for (var i = $rootScope.featureFlags.length - 1; i >= 0; i--) {
          if ($rootScope.featureFlags[i].name == feature && $rootScope.featureFlags[i].status === 'enabled') return true;
        };

        return false;
      };

      // Wait for all categories to load
      $q.all([reportsCategories.$promise, inventoryCategories.$promise, check.$promise, flags.$promise]).then(function() {
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
    var categories = $rootScope.reportCategories;

    for (var i = categories.length - 1; i >= 0; i--) {
      if (categories[i].id === id)
      {
        return categories[i];
      }

      if (categories[i].subcategories.length !== 0)
      {
        for (var j = categories[i].subcategories.length - 1; j >= 0; j--) {
          if (categories[i].subcategories[j].id === id)
          {
            return categories[i].subcategories[j];
          }
        };
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

        $scope.confirmedCategory = false;

        $scope.selectedCategory = null;
        $scope.selectedSubcategory = null;

        $scope.close = function () {
          $modalInstance.close();
        };

        $scope.selectCategory = function(categoryData) {
          $scope.selectedCategory = categoryData;
          $scope.selectedSubcategory = null;
        };

        $scope.selectSubcategory = function(categoryData) {
          $scope.selectedSubcategory = categoryData;
        };

        $scope.confirmCategory = function() {
          $scope.confirmedCategory = true;
          $scope.categoryData = ($scope.selectedSubcategory !== null) ? $scope.selectedSubcategory : $scope.selectedCategory;
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
              reference: $scope.reference,
              images: images
            });

            newReport.$save(function(data) {
              $modalInstance.close();

              var msg = 'Você será avisado quando sua solicitação for atualizada. Anote seu protocolo: ' + data.report.protocol + '.';

              if ($rootScope.isFeatureEnabled('show_resolution_time_to_clients') && data.report.category.resolution_time_enabled)
              {
                var DAY = 60 * 60 * 24, HOUR = 60 * 60, MINUTE = 60;

                var checkTimeFormat = function(timeInSeconds) {
                  if (timeInSeconds % DAY == 0)
                  {
                    return DAY;
                  }
                  else if (timeInSeconds % HOUR == 0)
                  {
                    return HOUR;
                  }
                  else
                  {
                    return MINUTE;
                  }
                };

                var timeFormat = checkTimeFormat(data.report.category.resolution_time);

                msg += ' Prazo estimado para a solução: ' + (data.report.category.resolution_time / timeFormat);

                if (timeFormat == DAY) msg +=  ' dias.';
                else if (timeFormat == HOUR) msg +=  ' horas.';
                else if (timeFormat == MINUTE) msg +=  ' minutos.';
              }

              Alert.show('Solicitação enviada com sucesso.', msg, function() {
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

        //if (report.comments_count > 0)
        if (true)
        {
          $scope.loadingComments = true;

          Reports.getItems({ id: report.id, return_fields: 'comments.id,comments.message,comments.created_at' }, function(data) {
            $scope.loadingComments = false;

            $scope.comments = data.report.comments;
          });
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

  $rootScope.viewItemWithReports = function(item) {
    var id = item.inventory_item_id, categoryId = item.inventory_item_category_id;

    Inventory.getItems({ id: id, display_type: 'full' }, function(data) {
      $rootScope.viewItem(data.item, $rootScope.getInventoryCategory(categoryId), true);
    });
  },

  $rootScope.loadItem = function(item) {
    var id = item.id, categoryId = item.inventory_category_id;

    Inventory.getItems({ id: id, display_type: 'full' }, function(data) {
      $rootScope.viewItem(data.item, $rootScope.getInventoryCategory(categoryId), false);
    });
  },

  $rootScope.viewItem = function(item, category, viewReports) {
    console.log(item, category, viewReports);

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
      controller: ['$scope', '$modalInstance', 'item', 'category', 'Reports', function($scope, $modalInstance, item, category, Reports) {
        $scope.item = item;
        $scope.category = category;
        $scope.currentTab = 0;

        if (viewReports === true)
        {
          $scope.currentTab = 1;
        }

        $scope._Index = 0;

        $scope.scrollTo = function(index) {
          $scope.position = {left:(400 * index * -1) + "px"};
          $scope._Index = index;
        };

        $scope.isActive = function (index) {
          return $scope._Index === index;
        };
        $scope.thumbs = [];

        $scope.getDataByInventoryFieldId = function(id) {
          for (var i = $scope.item.data.length - 1; i >= 0; i--) {
            if (typeof $scope.item.data[i].field !== 'undefined' && $scope.item.data[i].field !== null && $scope.item.data[i].field.id === parseInt(id)) // jshint ignore:line
            {
              return $scope.item.data[i].content;
            }
          }

          return null;
        };

        // we get all the item's images
        var images = [];

        for (var i = $scope.item.data.length - 1; i >= 0; i--) {
          var data  = $scope.item.data[i];

          if (data.field.kind === 'images')
          {
            for (var j = data.content.length - 1; j >= 0; j--) {
              images.push(data.content[j]);
            };
          }
        };

        if (images.length !== 0)
        {
          $scope.images = images;
        }

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
