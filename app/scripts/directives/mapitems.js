'use strict';

angular.module('zupWebAngularApp')

.directive('mapItems', function () {
  return {
    restrict: 'A',
    link: function(scope, element) {

      element.css({'width': $(window).width() - 300, 'height': $(window).height() });

      /* Google Maps */
      var styles = [{}, {
          'featureType': 'poi.business',
          'elementType': 'labels',
          'stylers': [{
            'visibility': 'off'
          }]
        },{
          'featureType': 'poi.government',
          'elementType': 'labels',
          'stylers': [{
            'visibility': 'off'
          }]
        }, {
          'featureType': 'poi.medical',
          'elementType': 'labels',
          'stylers': [{
            'visibility': 'off'
          }]
        }, {
          'featureType': 'poi.place_of_worship',
          'elementType': 'labels',
          'stylers': [{
            'visibility': 'off'
          }]
        }, {
          'featureType': 'poi.school',
          'elementType': 'labels',
          'stylers': [{
            'visibility': 'off'
          }]
        }, {
          'featureType': 'poi.sports_complex',
          'elementType': 'labels',
          'stylers': [{
            'visibility': 'off'
          }]
        }, {
          'featureType': 'transit',
          'elementType': 'labels',
          'stylers': [{
            'visibility': 'off'
          }, {
            'saturation': -100
          }, {
            'lightness': 42
          }]
        }, {
          'featureType': 'road.highway',
          'elementType': 'geometry.fill',
          'stylers': [{
            'saturation': -100
          }, {
            'lightness': 47
          }]
        }, {
          'featureType': 'landscape',
          'stylers': [{
            'lightness': 82
          }, {
            'saturation': -100
          }]
        }, {
          'featureType': 'water',
          'stylers': [{
            'hue': '#00b2ff'
          }, {
            'saturation': -21
          }, {
            'lightness': -4
          }]
        }, {
          'featureType': 'poi',
          'stylers': [{
            'lightness': 19
          }, {
            'weight': 0.1
          }, {
            'saturation': -22
          }]
        }, {
          'elementType': 'geometry.fill',
          'stylers': [{
            'visibility': 'on'
          }, {
            'lightness': 18
          }]
        }, {
          'elementType': 'labels.text',
          'stylers': [{
            'saturation': -100
          }, {
            'lightness': 28
          }]
        }, {
          'featureType': 'poi.attraction',
          'elementType': 'labels',
          'stylers': [{
            'visibility': 'off'
          }]
        }, {
          'featureType': 'poi.park',
          'elementType': 'geometry.fill',
          'stylers': [{
            'saturation': 12
          }, {
            'lightness': 25
          }]
        }, {
          'featureType': 'road',
          'elementType': 'labels.icon',
          'stylers': [{
            'visibility': 'off'
          }]
        }, {
          'featureType': 'road',
          'elementType': 'labels.text',
          'stylers': [{
            'lightness': 30
          }]
        }, {
          'featureType': 'landscape.man_made',
          'elementType': 'labels',
          'stylers': [{
            'visibility': 'off'
          }]
        }, {
          'featureType': 'road.highway',
          'elementType': 'geometry',
          'stylers': [{
            'saturation': -100
          }, {
            'lightness': 56
          }]
        }, {
          'featureType': 'road.local',
          'elementType': 'geometry.fill',
          'stylers': [{
            'lightness': 62
          }]
        }, {
          'featureType': 'landscape.man_made',
          'elementType': 'geometry',
          'stylers': [{
            'visibility': 'off'
          }]
        }];

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

      var markers = [[], [], [], [], []];

      var pinImages = [
          'images/map_pin_boca-lobo.png', // 0
          'images/map_pin_entulho.png', // 1
          'images/ponto_bocalobo.png', // 2
          'images/ponto_floresta-urbana.png', // 3
          'images/ponto_praca-wifi.png' // 4
        ];

      var pinLatLng = [
        // 0
        [[-23.549671, -46.6321713]],
        // 1
        [[-23.549297, -46.633701]],
        // 2
        [[-23.552349, -46.632923], [-23.551926, -46.632601], [-23.551130, -46.632376], [-23.549861, -46.632065], [-23.549310, -46.632043], [-23.548307, -46.632494]],
        // 3
        [[-23.549822, -46.631056], [-23.549654, -46.630638], [-23.550087, -46.630852], [-23.549969, -46.630509], [-23.549841, -46.630273], [-23.549290, -46.629908], [-23.549576, -46.629544]],
        // 4
        [[-23.550878, -46.631134]]
      ];

      var pinTooltip = [
        // 0
        [['<h1>Coleta de entulho</h1><p>Enviada ontem</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>']],

        // 1
        [['<h1>Coleta de entulho</h1><p>Enviada hoje</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>']],

        // 2
        [
          ['<h1>Coleta de entulho</h1><p>Enviada hoje</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>'],
          ['<h1>Coleta de entulho</h1><p>Enviada há 3 dias</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>'],
          ['<h1>Coleta de entulho</h1><p>Enviada há 5 dias</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>'],
          ['<h1>Coleta de entulho</h1><p>Enviada há 4 dias</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>'],
          ['<h1>Coleta de entulho</h1><p>Enviada há 6 dias</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>'],
          ['<h1>Coleta de entulho</h1><p>Enviada há 2 dias</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>']
        ],
        // 3
        [
          ['<h1>Coleta de entulho</h1><p>Enviada hoje</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>'],
          ['<h1>Coleta de entulho</h1><p>Enviada ontem</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>'],
          ['<h1>Coleta de entulho</h1><p>Enviada há 2 dias</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>'],
          ['<h1>Coleta de entulho</h1><p>Enviada há 3 dias</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>'],
          ['<h1>Coleta de entulho</h1><p>Enviada há 4 dias</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>'],
          ['<h1>Coleta de entulho</h1><p>Enviada há 5 dias</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>']
        ],
        // 4
        [
          ['<h1>Coleta de entulho</h1><p>Enviada há 1 semana</p><a href="#/items/1" data-toggle="modal" data-target="#item_pin1">Ver detalhes</a>']
        ]
      ];

      // Limpeza de boca de lobo
      for (var i = pinLatLng[0].length - 1; i >= 0; i--) {
        var LatLng = new google.maps.LatLng(pinLatLng[0][i][0], pinLatLng[0][i][1]);

        var pin = new google.maps.Marker({
            position: LatLng,
            map: map,
            icon: pinImages[0],
            animation: google.maps.Animation.DROP
          });

        markers[0].push(pin);

        var infowindow = new google.maps.InfoWindow();

        var pos = i;

        google.maps.event.addListener(pin, 'click', function() {
          console.log(pos);
          infowindow.setContent('<div class="pinTooltip">' + pinTooltip[0][pos] + '</div>');
          infowindow.open(map, this);
        });
      };

      // Coleta de entulho
      for (var i = pinLatLng[1].length - 1; i >= 0; i--) {
          var LatLng = new google.maps.LatLng(pinLatLng[1][i][0], pinLatLng[1][i][1]);

          var pin = new google.maps.Marker({
              position: LatLng,
              map: map,
              icon: pinImages[1],
              animation: google.maps.Animation.DROP
          });

          markers[1].push(pin);

          var infowindow = new google.maps.InfoWindow(), pos = i;

          google.maps.event.addListener(pin, 'click', function() {
            infowindow.setContent('<div class="pinTooltip">' + pinTooltip[1][pos] + '</div>');
            infowindow.open(map, this);
          });
      };

      // Pontos boca de lobo
      for (var i = pinLatLng[2].length - 1; i >= 0; i--) {
          var LatLng = new google.maps.LatLng(pinLatLng[2][i][0], pinLatLng[2][i][1]);

          var pin = new google.maps.Marker({
              position: LatLng,
              map: map,
              icon: pinImages[2],
              animation: google.maps.Animation.DROP
          });

          markers[2].push(pin);

          var infowindow = new google.maps.InfoWindow(), pos = i;

          google.maps.event.addListener(pin, 'click', function() {
              infowindow.setContent('<div class="pinTooltip">' + pinTooltip[2][pos] + '</div>');
              infowindow.open(map, this);
          });
      };

      // Pontos floresta urbana
      for (var i = pinLatLng[3].length - 1; i >= 0; i--) {
          var LatLng = new google.maps.LatLng(pinLatLng[3][i][0], pinLatLng[3][i][1]);

          var pin = new google.maps.Marker({
              position: LatLng,
              map: map,
              icon: pinImages[3],
              animation: google.maps.Animation.DROP
          });

          markers[3].push(pin);

          var infowindow = new google.maps.InfoWindow(), pos = i;

          google.maps.event.addListener(pin, 'click', function() {
              infowindow.setContent('<div class="pinTooltip">' + pinTooltip[3][pos] + '</div>');
              infowindow.open(map, this);
          });
      };

      // Pontos praça com wi-fi
      for (var i = pinLatLng[4].length - 1; i >= 0; i--) {
          var LatLng = new google.maps.LatLng(pinLatLng[4][i][0], pinLatLng[4][i][1]);

          var pin = new google.maps.Marker({
              position: LatLng,
              map: map,
              icon: pinImages[4],
              animation: google.maps.Animation.DROP
          });

          markers[4].push(pin);

          var infowindow = new google.maps.InfoWindow(), pos = i;

          google.maps.event.addListener(pin, 'click', function() {
            infowindow.setContent('<div class="pinTooltip">' + pinTooltip[4][pos] + '</div>');
            infowindow.open(map, this);
          });
      };

      $(window).resize(function() {
        element.css({'width': $(window).width() - 300, 'height': $(window).height() });
      });
    }
  };
});
