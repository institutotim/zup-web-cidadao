'use strict';

angular.module('zupWebAngularApp')

.service('User', ['$q', '$http', 'Auth', function ($q, $http, Auth) {

  return function(email, password) {

    /**
      Simple Auth

      [code]
        var user = new User(email, password);
        var promise = user.auth();

        promise.then(function() {
          // success
        }, function() {
          // error
        });
      [/code]
    **/

    this.auth = function() {
      var deferred = $q.defer();

      var req = $http({method: 'POST', url: '{base_url}/authenticate', data: {email: email, password: password}, expectedErrors: [400, 401]});

      req.success(function(data) {
        // save user data returned by API
        Auth.saveUser(data.user);

        // save token on cookie
        Auth.saveToken(data.token);

        deferred.resolve();
      });

      req.error(function(data, status, headers, config) {
        deferred.reject({data: data, status: status, config: config});
      });

      return deferred.promise;
    };

  };
}]);

