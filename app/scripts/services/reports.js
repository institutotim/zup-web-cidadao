'use strict';

angular.module('zupWebAngularApp')

.factory('Reports', function ($resource) {
  return $resource('{base_url}/reports/categories/:id.json', { id:'@id' },
    {
      'getItemsByCategory': { url: '{base_url}/reports/:categoryId/items.json', method: 'GET', params: { categoryId: '@categoryId' } },
      'getItems': { url: '{base_url}/reports/items/:id.json', method: 'GET', params: { id:'@id' } },
      'save': { url: '{base_url}/reports/:categoryId/items.json', method: 'POST', params: { categoryId:'@categoryId' } },
      'getMyItems': {url: '{base_url}/reports/users/me/items.json', method: 'GET'},
      'getReportsByItem': { url: '{base_url}/reports/inventory/:itemId/items.json', method: 'GET', params: { itemId: '@itemId' } },
      'getStats': {url: '{base_url}/reports/stats.json', method: 'GET'}
    });
});
