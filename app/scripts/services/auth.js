'use strict';

angular.module('zupWebAngularApp')

.factory('Auth', function ($q, $http, $cookies, $rootScope) {
  var user = null;

  return {

    check: function() {
      var deferred = $q.defer(),
          token = this.getToken();

      if (token !== null && user === null)
      {
        // has token, check it by getting user data
        var req = $http({method: 'GET', url: '{base_url}/me', headers: {'X-App-Token': token }}), that = this;

        req.success(function(data) {
          // save user data returned by API
          that.saveUser(data.user);

          deferred.resolve();
        });

        req.error(function() {
          deferred.reject();
          that.clearToken();
        });
      }
      else if (token !== null && user !== null)
      {
        // Has token and user data
        deferred.resolve();
      }
      else
      {
        // Doesn't have token, user needs to log in
        deferred.reject();
        this.clearToken();
      }

      return deferred.promise;
    },

    getToken: function() {
      var cookie = $cookies.token;

      if (typeof cookie === 'undefined')
      {
        return null;
      }

      return cookie;
    },

    saveToken: function(token) {
      $cookies.token = token;
    },

    clearToken: function() {
      delete $cookies.token;
    },

    saveUser: function(data) {
      user = data;

      $rootScope.me = user;
    },

    isLogged: function() {
      return user !== null && this.getToken() !== null;
    }

  };
});
