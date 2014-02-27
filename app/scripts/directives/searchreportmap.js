/* global google */
'use strict';

angular.module('zupWebAngularApp')
  .directive('searchReportMap', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        google.maps.event.clearListeners(scope.mapProvider.map);

        var options = {
          types: ['geocode'],
          componentRestrictions: { country: 'br' }
        };

        var autocomplete = new google.maps.places.Autocomplete(element[0], options);
        autocomplete.bindTo('bounds', scope.mapProvider.map);

        google.maps.event.addListener(autocomplete, 'place_changed', function() {
          var place = autocomplete.getPlace();

          if (!place.geometry) {
            return;
          }

          if (place.geometry.viewport) {
            scope.mapProvider.map.fitBounds(place.geometry.viewport);
          } else {
            scope.mapProvider.map.setCenter(place.geometry.location);
            scope.mapProvider.map.setZoom(17);
          }

          if (scope.mapProvider.allows_arbitrary_position == true)
          {
            scope.mapProvider.mainMarker.setPosition(place.geometry.location);
            scope.mapProvider.changedMarkerPosition(place.geometry.location.lat(), place.geometry.location.lng());
          }
          else
          {
            var marker = new google.maps.Marker({
              map: scope.mapProvider.map,
              position: place.geometry.location
            });

            marker.setIcon(({
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(35, 35),
            }));
          }
        });
      }
    };
  });
