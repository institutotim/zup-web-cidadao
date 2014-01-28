'use strict';

angular.module('zupWebAngularApp')

.factory('Reports', function ($resource) {
  return $resource('{base_url}/reports/categories/:id.json', { id:'@id' },
    {
      'getItemsByCategory': { url: '{base_url}/reports/:categoryId/items.json', method: 'GET', params: { categoryId:'@categoryId' } },
      'getItem': { url: '{base_url}/reports/items/:id.json', params: { id:'@id' } },
      'save': { url: '{base_url}/reports/:categoryId/items.json', method: 'POST', params: { categoryId:'@categoryId' } },
    });
});
