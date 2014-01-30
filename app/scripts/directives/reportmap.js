/* global google */
/* jshint camelcase: false */
'use strict';

angular.module('zupWebAngularApp')
  .directive('reportMap', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var styles = [{}, {'featureType': 'poi.business', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] },{ 'featureType': 'poi.government', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.medical', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.place_of_worship', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.school', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.sports_complex', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'transit', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }, { 'saturation': -100 }, { 'lightness': 42 }] }, { 'featureType': 'road.highway', 'elementType': 'geometry.fill', 'stylers': [{ 'saturation': -100 }, { 'lightness': 47 }] }, { 'featureType': 'landscape', 'stylers': [{ 'lightness': 82 }, { 'saturation': -100 }] }, { 'featureType': 'water', 'stylers': [{ 'hue': '#00b2ff' }, { 'saturation': -21 }, { 'lightness': -4 }] }, { 'featureType': 'poi', 'stylers': [{ 'lightness': 19 }, { 'weight': 0.1 }, { 'saturation': -22 }] }, { 'elementType': 'geometry.fill', 'stylers': [{ 'visibility': 'on' }, { 'lightness': 18 }] }, { 'elementType': 'labels.text', 'stylers': [{ 'saturation': -100 }, { 'lightness': 28 }] }, { 'featureType': 'poi.attraction', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.park', 'elementType': 'geometry.fill', 'stylers': [{ 'saturation': 12 }, { 'lightness': 25 }] }, { 'featureType': 'road', 'elementType': 'labels.icon', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'road', 'elementType': 'labels.text', 'stylers': [{ 'lightness': 30 }] }, { 'featureType': 'landscape.man_made', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [{ 'saturation': -100 }, { 'lightness': 56 }] }, { 'featureType': 'road.local', 'elementType': 'geometry.fill', 'stylers': [{ 'lightness': 62 }] }, { 'featureType': 'landscape.man_made', 'elementType': 'geometry', 'stylers': [{ 'visibility': 'off' }] }];

        var styledMap = new google.maps.StyledMapType(styles, { name: 'zup' });

        var homeLatLng = new google.maps.LatLng(-23.549671, -46.6321713);

        var mapOptions = {
          center: homeLatLng,
          zoom: 17,
          mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'zup']
          }
        };

        var map = new google.maps.Map(element[0], mapOptions);

        var marker = new google.maps.Marker(
        {
          map: map,
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: homeLatLng
        });

        map.mapTypes.set('zup', styledMap);
        map.setMapTypeId('zup');

        // Set position and address
        google.maps.event.addListener(marker, 'dragend', function()
        {
          var geocoder = new google.maps.Geocoder();

          scope.$parent.lat = marker.getPosition().lat();
          scope.$parent.lng = marker.getPosition().lng();

          geocoder.geocode({
            latLng: marker.getPosition()
          },
          function(results, status)
          {
            if (status === google.maps.GeocoderStatus.OK)
            {
              scope.$parent.formattedAddress = results[0].formatted_address;
            }
            else
            {
              console.log('Cannot determine address at this location.' + status);
            }
          });
        });

        // refresh map when shown
        scope.$watch('categoryData', function () {
          setTimeout(function(){
            google.maps.event.trigger(map, 'resize');
            google.maps.event.trigger(map, 'bounds_changed');
            map.setCenter(marker.getPosition());

            if (scope.$parent.categoryData !== null)
            {
              marker.setIcon(scope.$parent.categoryData.marker.url);
            }

            // clear addresses
            scope.$parent.lat = null;
            scope.$parent.lng = null;
            scope.$parent.formattedAddress = null;
          }, 80);
        });

      }
    };
  });
