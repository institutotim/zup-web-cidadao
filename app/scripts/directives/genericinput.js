'use strict';

angular.module('zupWebAngularApp')

.directive('genericInput', function () {
  return {
    restrict: 'A',
    link: function postLink(scope, element) {

      scope.$watch('inputErrors', function() {
        var errors = scope.inputErrors,
            label = angular.element('label[for=\'' + element.attr('id') + '\']');

        // clear errors
        element.removeClass('has-error');
        label.removeClass('has-error');

        if (typeof errors !== 'undefined')
        {
          for (var index in errors)
          {
            if (index === element.attr('name'))
            {
              element.addClass('has-error');
              label.addClass('has-error');
            }
          }
        }
      });

      scope.$parent.$watch('processingForm', function() {
        if (scope.$parent.processingForm === true)
        {
          element.attr('disabled', true);
        }
        else
        {
          element.attr('disabled', false);
        }
      });

    }
  };
});
