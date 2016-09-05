'use strict';

angular.module('zupWebAngularApp')

.factory('Inventory', function ($resource) {
  return $resource('{base_url}/inventory/categories/:id', { id:'@id' },
    {
      'getItems': { url: '{base_url}/inventory/items/:id', method: 'GET', params: { id:'@id' } },
      'getItem': { url: '{base_url}/inventory/categories/:categoryId/items/:id', method: 'GET', params: { id: '@id', categoryId: '@categoryId' } },
      'getCategory': { url: '{base_url}/inventory/categories/:id', method: 'GET', params: { id:'@id' } },
    });
});
