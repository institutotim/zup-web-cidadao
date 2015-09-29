'use strict';

angular.module('zupWebAngularApp')

.factory('Users', function ($resource) {
  return $resource('{base_url}/users/:id', { id:'@id' },
    {
      'save': { method: 'POST', expectedErrors: [400] },
      'update': { method: 'PUT', expectedErrors: [400] },
      'getAll': { method: 'GET' },
      'getMe' : {url: '{base_url}/me', method: 'GET'},
      'recoverPassword': { url: '{base_url}/recover_password', method: 'PUT', expectedErrors: [400] },
      'resetPassword': { url: '{base_url}/reset_password', method: 'PUT', expectedErrors: [400] }
    });
});
