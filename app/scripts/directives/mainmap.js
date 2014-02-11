/* global $, google */
/* jshint camelcase: false, -W083 */
'use strict';

angular.module('zupWebAngularApp')
  .directive('mainMap', function (Reports, $rootScope, $compile, $timeout) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        /*var styles = [{}, {'featureType': 'poi.business', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] },{ 'featureType': 'poi.government', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.medical', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.place_of_worship', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.school', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.sports_complex', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'transit', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }, { 'saturation': -100 }, { 'lightness': 42 }] }, { 'featureType': 'road.highway', 'elementType': 'geometry.fill', 'stylers': [{ 'saturation': -100 }, { 'lightness': 47 }] }, { 'featureType': 'landscape', 'stylers': [{ 'lightness': 82 }, { 'saturation': -100 }] }, { 'featureType': 'water', 'stylers': [{ 'hue': '#00b2ff' }, { 'saturation': -21 }, { 'lightness': -4 }] }, { 'featureType': 'poi', 'stylers': [{ 'lightness': 19 }, { 'weight': 0.1 }, { 'saturation': -22 }] }, { 'elementType': 'geometry.fill', 'stylers': [{ 'visibility': 'on' }, { 'lightness': 18 }] }, { 'elementType': 'labels.text', 'stylers': [{ 'saturation': -100 }, { 'lightness': 28 }] }, { 'featureType': 'poi.attraction', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.park', 'elementType': 'geometry.fill', 'stylers': [{ 'saturation': 12 }, { 'lightness': 25 }] }, { 'featureType': 'road', 'elementType': 'labels.icon', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'road', 'elementType': 'labels.text', 'stylers': [{ 'lightness': 30 }] }, { 'featureType': 'landscape.man_made', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [{ 'saturation': -100 }, { 'lightness': 56 }] }, { 'featureType': 'road.local', 'elementType': 'geometry.fill', 'stylers': [{ 'lightness': 62 }] }, { 'featureType': 'landscape.man_made', 'elementType': 'geometry', 'stylers': [{ 'visibility': 'off' }] }];

        // set start height
        element.css({'width': $(window).width() - 300, 'height': $(window).height() });

        var styledMap = new google.maps.StyledMapType(styles, { name: 'zup' });

        var homeLatlng = new google.maps.LatLng(-23.549671, -46.6321713);

        var mapOptions = {
            center: homeLatlng,
            zoom: 15,
            mapTypeControl: false,
            panControl: true,
            panControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT
            },
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT
            },
            scaleControl: true,
            scaleControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT
            },
            streetViewControl: true,
            streetViewControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT
            }
          };

        var map = new google.maps.Map(element[0], mapOptions);

        map.mapTypes.set('zup', styledMap);
        map.setMapTypeId('zup');

        // change div height and width to keep it fullscreen
        $(window).resize(function() {
          element.css({'width': $(window).width() - 300, 'height': $(window).height() });
        });

        google.maps.event.addListener(map, 'center_changed', function() {
          //console.log(map.getCenter());
        });

        var waitingRequest = false;

        scope.$watch('isLoading', function() {
          if (scope.isLoading === false)
          {
            // After we get everything that is needed to render the map...
            var params = {
              'position[latitude]': -23.549671,
              'position[longitude]': -46.6321713,
              'position[distance]': 100000,
              'max_items': 40
            };

            // FIXME Only use
            var getItems = function()
            {
              $rootScope.isLoadingMap = true;

              Reports.getItems(params, function(data) {
                // Hide every marker in the map
                for (var i = $rootScope.categories.length - 1; i >= 0; i--) {
                  angular.forEach($rootScope.markers.reports[$rootScope.categories[i].id], function(value, key){
                    value.setVisible(false);
                  });
                };

                for (var i = data.reports.length - 1; i >= 0; i--) {
                  var LatLng = new google.maps.LatLng(data.reports[i].position.latitude, data.reports[i].position.longitude);

                  var infowindow = new google.maps.InfoWindow(),
                      category = $rootScope.getReportCategory(data.reports[i].category_id);

                  var categoryIcon = new google.maps.MarkerImage(category.marker.retina.web, null, null, null, new google.maps.Size(54, 51));

                  var pin = new google.maps.Marker({
                      position: LatLng,
                      map: map,
                      animation: google.maps.Animation.DROP,
                      icon: categoryIcon,
                      category: category,
                      report: data.reports[i]
                    });

                  $rootScope.markers.reports[category.id][data.reports[i].id] = pin;
                  pin.setVisible(true);

                  google.maps.event.addListener(pin, 'click', function() {
                    var html = '<div class="pinTooltip"><h1>{{category.title}}</h1><p>Enviada {{ report.created_at | date: \'dd/MM/yy HH:mm\'}}</p><a href="" ng-click="viewReport(report, category)">Ver detalhes</a></div>';

                    var new_scope = scope.$new(true);

                    new_scope.category = this.category;
                    new_scope.report = this.report;
                    new_scope.viewReport = $rootScope.viewReport;

                    var compiled = $compile(html)(new_scope);

                    new_scope.$apply();

                    infowindow.setContent(compiled[0]);
                    infowindow.open(map, this);
                  });
                }

                $rootScope.isLoadingMap = false;

                console.log($rootScope.markers.reports);
              });
            };

            scope.$watch('itemsPeriod', function() {
              if (typeof scope.itemsPeriod !== 'undefined')
              {
                // Start loading
                $rootScope.isLoadingMap = true;

                params.begin_date = scope.itemsPeriod.beginDate;
                params.end_date = scope.itemsPeriod.endDate;

                getItems();

                // Active all filters back
                angular.element('.sidebar_filter').addClass('active');
              }
            });
          }
        });

        $rootScope.map = map;*/

        // new algorith
        var mapProvider = {
          options:
          {
            styles: [{}, {'featureType': 'poi.business', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] },{ 'featureType': 'poi.government', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.medical', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.place_of_worship', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.school', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.sports_complex', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'transit', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }, { 'saturation': -100 }, { 'lightness': 42 }] }, { 'featureType': 'road.highway', 'elementType': 'geometry.fill', 'stylers': [{ 'saturation': -100 }, { 'lightness': 47 }] }, { 'featureType': 'landscape', 'stylers': [{ 'lightness': 82 }, { 'saturation': -100 }] }, { 'featureType': 'water', 'stylers': [{ 'hue': '#00b2ff' }, { 'saturation': -21 }, { 'lightness': -4 }] }, { 'featureType': 'poi', 'stylers': [{ 'lightness': 19 }, { 'weight': 0.1 }, { 'saturation': -22 }] }, { 'elementType': 'geometry.fill', 'stylers': [{ 'visibility': 'on' }, { 'lightness': 18 }] }, { 'elementType': 'labels.text', 'stylers': [{ 'saturation': -100 }, { 'lightness': 28 }] }, { 'featureType': 'poi.attraction', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.park', 'elementType': 'geometry.fill', 'stylers': [{ 'saturation': 12 }, { 'lightness': 25 }] }, { 'featureType': 'road', 'elementType': 'labels.icon', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'road', 'elementType': 'labels.text', 'stylers': [{ 'lightness': 30 }] }, { 'featureType': 'landscape.man_made', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [{ 'saturation': -100 }, { 'lightness': 56 }] }, { 'featureType': 'road.local', 'elementType': 'geometry.fill', 'stylers': [{ 'lightness': 62 }] }, { 'featureType': 'landscape.man_made', 'elementType': 'geometry', 'stylers': [{ 'visibility': 'off' }] }],
            homeLatlng: new google.maps.LatLng(-23.549671, -46.6321713),
            map: {
              zoom: 15,
              mapTypeControl: false,
              panControl: true,
              panControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
              },
              zoomControl: true,
              zoomControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
              },
              scaleControl: true,
              scaleControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
              },
              streetViewControl: true,
              streetViewControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
              }
            }
          },

          zoomLevels: {},
          currentZoom: 15,
          map: null,
          getNewItemsTimeout: null,
          hideNotVisibleMarkersTimeout: null,
          doAnimation: true,

          start: function() {
            element.css({'width': $(window).width() - 300, 'height': $(window).height() });

            this.createMap();
            this.setListeners();
          },

          createMap: function() {
            var styledMap = new google.maps.StyledMapType(this.options.styles, { name: 'zup' });

            this.map = new google.maps.Map(element[0], this.options.map);

            this.map.mapTypes.set('zup', styledMap);
            this.map.setMapTypeId('zup');
            this.map.setCenter(this.options.homeLatlng);
          },

          setListeners: function() {
            // Set listener for when bounds changes
            google.maps.event.addListener(this.map, 'bounds_changed', function() {
              mapProvider.boundsChanged();
            });
          },

          getItems: function(options, callback) {
            var params = {
              'position[latitude]': options.center.lat(),
              'position[longitude]': options.center.lng(),
              'position[distance]': options.distance,
              'position[max_items]': 80
            };

            Reports.getItems(params, function(data) {
              callback();

              for (var i = data.reports.length - 1; i >= 0; i--) {
                mapProvider.addMarker(data.reports[i], mapProvider.doAnimation);
              }

              // after first request we will deactive animation
              if (mapProvider.doAnimation === true)
              {
                mapProvider.doAnimation = false;
              }
            });
          },

          boundsChanged: function() {
            var zoomToHide = null;

            if (typeof this.zoomLevels[this.map.getZoom()] === 'undefined')
            {
              this.zoomLevels[this.map.getZoom()] = {};
            }

            // Check if zoom has changed
            if (this.currentZoom !== this.map.getZoom())
            {
              zoomToHide = this.currentZoom;
              this.currentZoom = this.map.getZoom();
            }

            // Wait a bit until hide/show items
            if (this.hideNotVisibleMarkersTimeout)
            {
              $timeout.cancel(this.hideNotVisibleMarkersTimeout);
            };

            this.hideNotVisibleMarkersTimeout = $timeout(function() {
              mapProvider.hideNotVisibleMarkers();
            }, 200);

            // Wait a bit until get new items
            if (this.getNewItemsTimeout)
            {
              $timeout.cancel(this.getNewItemsTimeout);
            };

            $rootScope.isLoadingItems = true;

            this.getNewItemsTimeout = $timeout(function() {
              var items = mapProvider.getItems({
                center: mapProvider.map.getCenter(),
                distance: mapProvider.getDistance(),
                limit: 100
              }, function() {
                $rootScope.isLoadingItems = false;

                if (zoomToHide)
                {
                  mapProvider.hideAllMarkersFromZoomLevel(zoomToHide);
                }
              });
            }, 1000);
          },

          // Hide every marker that is not visible to the user
          hideNotVisibleMarkers: function() {
            angular.forEach(this.zoomLevels[this.map.getZoom()], function(marker, id) {
              if (!mapProvider.isMarkerInsideBounds(marker))
              {
                marker.setVisible(false);
              }
              else
              {
                marker.setVisible(true);
              }
            });
          },

          hideAllMarkersFromZoomLevel: function(zoomLevel) {
            angular.forEach(this.zoomLevels[zoomLevel], function(marker, id) {
              marker.setVisible(false);
            });
          },

          isMarkerInsideBounds: function(marker) {
            return this.map.getBounds().contains(marker.getPosition());
          },

          addMarker: function(report, effect) {
            if (typeof this.zoomLevels[this.map.getZoom()][report.id] === 'undefined')
            {
              var LatLng = new google.maps.LatLng(report.position.latitude, report.position.longitude);

              var infowindow = new google.maps.InfoWindow(),
                  category = $rootScope.getReportCategory(report.category_id);

              var categoryIcon = new google.maps.MarkerImage(category.marker.retina.web, null, null, null, new google.maps.Size(54, 51));

              var pinOptions = {
                position: LatLng,
                map: this.map,
                icon: categoryIcon,
                category: category,
                report: report
              };

              if (typeof effect !== 'undefined' && effect === true)
              {
                pinOptions.animation = google.maps.Animation.DROP;
              }

              var pin = new google.maps.Marker(pinOptions);

              this.zoomLevels[this.map.getZoom()][report.id] = pin;

              google.maps.event.addListener(pin, 'click', function() {
                var html = '<div class="pinTooltip"><h1>{{category.title}}</h1><p>Enviada {{ report.created_at | date: \'dd/MM/yy HH:mm\'}}</p><a href="" ng-click="viewReport(report, category)">Ver detalhes</a></div>';

                var new_scope = scope.$new(true);

                new_scope.category = this.category;
                new_scope.report = this.report;
                new_scope.viewReport = $rootScope.viewReport;

                var compiled = $compile(html)(new_scope);

                new_scope.$apply();

                infowindow.setContent(compiled[0]);
                infowindow.open(mapProvider.map, this);
              });
            }
          },

          getDistance: function() {
            var bounds = this.map.getBounds();

            var center = bounds.getCenter();
            var ne = bounds.getNorthEast();

            var dis = google.maps.geometry.spherical.computeDistanceBetween(center, ne);

            return dis;
          }
        };

        mapProvider.start();
      }
    };
  });
