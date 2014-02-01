/* global google */
'use strict';

angular.module('zupWebAngularApp')
  .directive('searchMap', function ($rootScope) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var map = $rootScope.map;

        var options = {
          types: ['geocode'],
          componentRestrictions: { country: 'br' }
        };

        var autocomplete = new google.maps.places.Autocomplete(element[0], options);
        autocomplete.bindTo('bounds', map);

        var marker = new google.maps.Marker({
          map: map
        });

        google.maps.event.addListener(autocomplete, 'place_changed', function() {
          marker.setVisible(false);

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

          marker.setIcon(({
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
          }));

          marker.setPosition(place.geometry.location);
          marker.setVisible(true);
        });

        // Detect when it's on streetview to hide search bar
        var thePanorama = map.getStreetView();

        google.maps.event.addListener(thePanorama, 'visible_changed', function() {
          if (thePanorama.getVisible()) {
            element.hide();
          } else {
            element.show();
          }
        });
      }
    };
  });
