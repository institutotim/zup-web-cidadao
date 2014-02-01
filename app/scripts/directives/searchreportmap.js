/* global google */
'use strict';

angular.module('zupWebAngularApp')
  .directive('searchReportMap', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var map = scope.reportMap;

        var options = {
          types: ['geocode'],
          componentRestrictions: { country: 'br' }
        };

        var autocomplete = new google.maps.places.Autocomplete(element[0], options);
        autocomplete.bindTo('bounds', map);

        google.maps.event.addListener(autocomplete, 'place_changed', function() {
          var place = autocomplete.getPlace();

          if (!place.geometry) {
            return;
          }

          if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
          } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
          }

          scope.reportMarker.setPosition(place.geometry.location);
          scope.reportChangedMarkerPosition();
        });
      }
    };
  });
