'use strict';

angular.module('zupWebAngularApp')

.factory('Users', function ($resource) {
  return $resource('{base_url}/users/:id.json', { id:'@id' },
    {
      'save': { method: 'POST', expectedErrors: [400] },
      'update': { method: 'PUT', expectedErrors: [400] },
      'getAll': { method: 'GET' },
      'recoverPassword': { url: '{base_url}/recover_password', method: 'PUT', expectedErrors: [400] }
    });
});
