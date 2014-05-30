'use strict'

angular.module('zupWebAngularApp')

.factory('Feedback', function ($resource) {
    return $resource('{base_url}/reports/:id/feedback.json', { id:'@feedbackId'},
      {
        'saveFeedback': { url: '{base_url}/reports/:id/feedback.json', method: 'POST', params: { id:'@id'}},
        'getFeedback' : { url: '{base_url}/reports/:id/feedback.json', method: 'GET', params: {id: '@feedbackId'} }
      }
    )
  });