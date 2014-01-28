/* global $, google */
'use strict';

angular.module('zupWebAngularApp')
  .directive('mainMap', function (Reports) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var styles = [{}, {'featureType': 'poi.business', 'elementType': 'labels', 'stylers': [{             'visibility': 'off'           }]         },{           'featureType': 'poi.government',           'elementType': 'labels',           'stylers': [{             'visibility': 'off'           }]         }, {           'featureType': 'poi.medical',           'elementType': 'labels',           'stylers': [{             'visibility': 'off'           }]         }, {           'featureType': 'poi.place_of_worship',           'elementType': 'labels',           'stylers': [{             'visibility': 'off'           }]         }, {           'featureType': 'poi.school',           'elementType': 'labels',           'stylers': [{             'visibility': 'off'           }]         }, {           'featureType': 'poi.sports_complex',           'elementType': 'labels',           'stylers': [{             'visibility': 'off'           }]         }, {           'featureType': 'transit',           'elementType': 'labels',           'stylers': [{             'visibility': 'off'           }, {             'saturation': -100           }, {             'lightness': 42           }]         }, {           'featureType': 'road.highway',           'elementType': 'geometry.fill',           'stylers': [{             'saturation': -100           }, {             'lightness': 47           }]         }, {           'featureType': 'landscape',           'stylers': [{             'lightness': 82           }, {             'saturation': -100           }]         }, {           'featureType': 'water',           'stylers': [{             'hue': '#00b2ff'           }, {             'saturation': -21           }, {             'lightness': -4           }]         }, {           'featureType': 'poi',           'stylers': [{             'lightness': 19           }, {             'weight': 0.1           }, {             'saturation': -22           }]         }, {           'elementType': 'geometry.fill',           'stylers': [{             'visibility': 'on'           }, {             'lightness': 18           }]         }, {           'elementType': 'labels.text',           'stylers': [{             'saturation': -100           }, {             'lightness': 28           }]         }, {           'featureType': 'poi.attraction',           'elementType': 'labels',           'stylers': [{             'visibility': 'off'           }]         }, {           'featureType': 'poi.park',           'elementType': 'geometry.fill',           'stylers': [{             'saturation': 12           }, {             'lightness': 25           }]         }, {           'featureType': 'road',           'elementType': 'labels.icon',           'stylers': [{             'visibility': 'off'           }]         }, {           'featureType': 'road',           'elementType': 'labels.text',           'stylers': [{             'lightness': 30           }]         }, {           'featureType': 'landscape.man_made',           'elementType': 'labels',           'stylers': [{             'visibility': 'off'           }]         }, {           'featureType': 'road.highway',           'elementType': 'geometry',           'stylers': [{             'saturation': -100           }, {             'lightness': 56           }]         }, {           'featureType': 'road.local',           'elementType': 'geometry.fill',           'stylers': [{             'lightness': 62           }]         }, {           'featureType': 'landscape.man_made',           'elementType': 'geometry',           'stylers': [{             'visibility': 'off'           }]         }];

        // set start height
        element.css({'width': $(window).width() - 300, 'height': $(window).height() });

        var styledMap = new google.maps.StyledMapType(styles, { name: 'zup' });

        var homeLatlng = new google.maps.LatLng(-23.549671, -46.6321713);

        var mapOptions = {
          center: homeLatlng,
          zoom: 17,
          disableDefaultUI: true,
          mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'zup']
          }
        };

        var map = new google.maps.Map(element[0], mapOptions);

        map.mapTypes.set('zup', styledMap);
        map.setMapTypeId('zup');

        // change div height and width to keep it fullscreen
        $(window).resize(function() {
          element.css({'width': $(window).width() - 300, 'height': $(window).height() });
        });

        var params = {
          'position[latitude]': -23.549671,
          'position[longitude]': -46.6321713,
          'position[distance]': 10000,
          'max_items': 40
        };

        Reports.getItems(params, function(data) {
          console.log(data);
        });
      }
    };
  });
