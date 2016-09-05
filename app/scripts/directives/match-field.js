'use strict';

angular.module('zupWebAngularApp')
  .directive('matchField', function ($log, $parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
          if(!ctrl) {
            $log.warn('Match validation requires ngModel to be on the element');
            return;
          }

          var matchGetter = $parse(attrs.matchField);
          var modelSetter = $parse(attrs.ngModel).assign;

          scope.$watch(getMatchValue, function(){
            modelSetter(scope, parser(ctrl.$viewValue));
          });

          ctrl.$parsers.unshift(parser);
          ctrl.$formatters.unshift(formatter);

          function parser(viewValue){
            if(viewValue === getMatchValue()){
              ctrl.$setValidity('match', true);
              return viewValue;
            }else{
              ctrl.$setValidity('match', false);
              return undefined;
            }
          }

          function formatter(modelValue){
            return modelValue === undefined? ctrl.$isEmpty(ctrl.$viewValue)? undefined : ctrl.$viewValue : modelValue;
          }

          function getMatchValue(){
            var match = matchGetter(scope);
            if(angular.isObject(match) && match.hasOwnProperty('$viewValue')){
              match = match.$viewValue;
            }
            return match;
          }
        }
    };
  });
