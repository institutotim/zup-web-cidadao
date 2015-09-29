'use strict';

angular.module('zupWebAngularApp')

.factory('Flags', function ($resource) {
  return $resource('{base_url}/feature_flags/:id', { id:'@id' },
    {
      'getAll': { url: '{base_url}/feature_flags', method: 'GET' }
    });
});
