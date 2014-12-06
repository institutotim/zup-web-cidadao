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
  }).directive('passwordMatch', [function () {
    return {
      restrict: 'A',
      scope:true,
      require: 'ngModel',
      link: function (scope, elem , attrs,control) {
        var checker = function () {

          //get the value of the first password
          var e1 = scope.$eval(attrs.ngModel);

          //get the value of the other password
          var e2 = scope.$eval(attrs.passwordMatch);
          return e1 == e2;
        };
        scope.$watch(checker, function (n) {
          //set the form control to valid if both
          //passwords are the same, else invalid
          control.$setValidity("unique", n);
        });
      }
    };
  }]);
