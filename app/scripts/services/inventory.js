'use strict';

angular.module('zupWebAngularApp')

.factory('Inventory', function ($resource) {
  return $resource('{base_url}/inventory/categories/:id.json', { id:'@id' },
    {
      'getItems': { url: '{base_url}/inventory/items/:id.json', method: 'GET', params: { id:'@id' } }
    });
});
