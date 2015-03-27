'use strict';

angular.module('zupWebAngularApp')

.factory('Reports', function ($resource) {
  return $resource('{base_url}/reports/categories/:id', { id:'@id' },
    {
      'getItemsByCategory': { url: '{base_url}/reports/:categoryId/items', method: 'GET', params: { categoryId: '@categoryId' } },
      'getItems': { url: '{base_url}/reports/items/:id', method: 'GET', params: { id:'@id' } },
      'save': { url: '{base_url}/reports/:categoryId/items', method: 'POST', params: { categoryId:'@categoryId' } },
      'getMyItems': {url: '{base_url}/reports/users/me/items', method: 'GET'},
      'getReportsByItem': { url: '{base_url}/reports/inventory/:itemId/items', method: 'GET', params: { itemId: '@itemId' } },
      'getStats': {url: '{base_url}/reports/stats', method: 'GET'}
    });
});
