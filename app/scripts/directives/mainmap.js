/* global $, google */
/* jshint camelcase: false, -W083 */
'use strict';

angular.module('zupWebAngularApp')
  .directive('mainMap', function (Reports, $rootScope, $compile, $timeout, Inventory, $q) {
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
          activeMethod: 'reports', // or items
          activeInventoryFilters: [],
          hiddenReportsCategories: [],
          hiddenInventoryCategories: [1, 2, 3],

          start: function() {
            element.css({'width': $(window).width() - 300, 'height': $(window).height() });
            scope.readyToFilterInventoryItems = false;

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

          getReports: function(options, callback) {
            var params = {
              'position[latitude]': options.center.lat(),
              'position[longitude]': options.center.lng(),
              'position[distance]': options.distance,
              'position[max_items]': 80
            };

            var reportsData = Reports.getItems(params);

            return reportsData;
          },

          getItems: function(options, precallback) {
            var params = {
              'position[latitude]': options.center.lat(),
              'position[longitude]': options.center.lng(),
              'position[distance]': options.distance,
              'position[max_items]': 80
            };

            var itemsData = Inventory.getItems(params);

            return itemsData;
          },

          boundsChanged: function() {
            var clearLevels = false;

            if (typeof this.zoomLevels[this.map.getZoom()] === 'undefined')
            {
              this.zoomLevels[this.map.getZoom()] = {};
            }

            // Check if zoom has changed
            if (this.currentZoom !== this.map.getZoom())
            {
              clearLevels = true;

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
              var reports = mapProvider.getReports({
                center: mapProvider.map.getCenter(),
                distance: mapProvider.getDistance(),
                limit: 100
              });

              var items = mapProvider.getItems({
                center: mapProvider.map.getCenter(),
                distance: mapProvider.getDistance(),
                limit: 100
              });

              $q.all([reports.$promise, items.$promise]).then(function(values) {
                $rootScope.isLoadingItems = false;

                if (clearLevels)
                {
                  mapProvider.hideAllMarkersFromInactiveLevels();
                }

                // add reports
                for (var i = values[0].reports.length - 1; i >= 0; i--) {
                  mapProvider.addMarker(values[0].reports[i], mapProvider.doAnimation, 'report');
                }

                // add items
                for (var i = values[1].items.length - 1; i >= 0; i--) {
                  mapProvider.addMarker(values[1].items[i], mapProvider.doAnimation, 'items');
                }

                // after first request we will deactive animation
                if (mapProvider.doAnimation === true)
                {
                  mapProvider.doAnimation = false;
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
                var cat, pos;

                if (marker.type === 'report')
                {
                  pos = mapProvider.hiddenReportsCategories.indexOf(marker.item.category_id);
                }

                if (marker.type === 'item')
                {
                  pos = mapProvider.hiddenInventoryCategories.indexOf(marker.item.inventory_category_id);
                }

                if (!~pos)
                {
                  marker.setVisible(true);
                }
              }
            });
          },

          hideAllMarkersFromInactiveLevels: function() {
            angular.forEach(this.zoomLevels, function(zoomLevel, zoomLevelId) {
              console.log(zoomLevelId, mapProvider.currentZoom);
              if (zoomLevelId != mapProvider.currentZoom)
              {
                angular.forEach(zoomLevel, function(marker, id) {
                  marker.setVisible(false);
                });
              }
            });
          },

          isMarkerInsideBounds: function(marker) {
            return this.map.getBounds().contains(marker.getPosition());
          },

          addMarker: function(item, effect, type) {
            if (typeof this.zoomLevels[this.map.getZoom()][type + '_' + item.id] === 'undefined')
            {
              var LatLng = new google.maps.LatLng(item.position.latitude, item.position.longitude);

              var infowindow = new google.maps.InfoWindow();

              var category, iconSize, viewAction, itemType, visibility = false;

              if (type === 'report')
              {
                category = $rootScope.getReportCategory(item.category_id);
                iconSize = new google.maps.Size(54, 51);
                viewAction = $rootScope.viewReport;
                itemType = 'report';

                var pos = mapProvider.hiddenReportsCategories.indexOf(item.category_id);

                if (!~pos)
                {
                  visibility = true;
                }
              }
              else
              {
                category = $rootScope.getInventoryCategory(item.inventory_category_id);
                iconSize = new google.maps.Size(15, 15);
                viewAction = $rootScope.viewItem;
                itemType = 'item';

                var pos = mapProvider.hiddenInventoryCategories.indexOf(item.inventory_category_id);

                if (!~pos)
                {
                  visibility = true;
                }
              }

              var categoryIcon = new google.maps.MarkerImage(category.marker.retina.web, null, null, null, iconSize);

              var pinOptions = {
                position: LatLng,
                map: this.map,
                icon: categoryIcon,
                category: category,
                item: item,
                type: itemType
              };

              if (typeof effect !== 'undefined' && effect === true)
              {
                pinOptions.animation = google.maps.Animation.DROP;
              }

              var pin = new google.maps.Marker(pinOptions);

              if (!visibility)
              {
                pin.setVisible(false);
              }

              this.zoomLevels[this.map.getZoom()][type + '_' + item.id] = pin;

              google.maps.event.addListener(pin, 'click', function() {
                var html = '<div class="pinTooltip"><h1>{{category.title}}</h1><p>Enviada {{ item.created_at | date: \'dd/MM/yy HH:mm\'}}</p><a href="" ng-click="view(item, category)">Ver detalhes</a></div>';

                var new_scope = scope.$new(true);

                new_scope.category = this.category;
                new_scope.item = this.item;
                new_scope.view = viewAction;

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
          },

          filterItems: function(inventoryId) {
            var pos = mapProvider.hiddenInventoryCategories.indexOf(inventoryId);

            if (~pos)
            {
              mapProvider.toggleItemsVisibility(inventoryId, 'show');
              mapProvider.hiddenInventoryCategories.splice(pos, 1);
            }
            else
            {
              mapProvider.toggleItemsVisibility(inventoryId, 'hide');
              mapProvider.hiddenInventoryCategories.push(inventoryId);
            };
          },

          filterReports: function(reportCategoryId) {
            var pos = mapProvider.hiddenReportsCategories.indexOf(reportCategoryId);

            if (~pos)
            {
              mapProvider.toggleReportCategoryVisibility(reportCategoryId, 'show');
              mapProvider.hiddenReportsCategories.splice(pos, 1);
            }
            else
            {
              mapProvider.toggleReportCategoryVisibility(reportCategoryId, 'hide');
              mapProvider.hiddenReportsCategories.push(reportCategoryId);
            };
          },

          toggleReportCategoryVisibility: function(reportCategoryId, action) {
            angular.forEach(mapProvider.zoomLevels, function(zoomLevel, zoomLevelId) {
              angular.forEach(zoomLevel, function(marker, id) {
                if (mapProvider.isMarkerInsideBounds(marker))
                {
                  if (marker.item.category_id === reportCategoryId)
                  {
                    if (action === 'show')
                    {
                      marker.setVisible(true);
                    };

                    if (action === 'hide')
                    {
                      marker.setVisible(false);
                    };
                  }
                }
              });
            });
          },

          toggleItemsVisibility: function(inventoryId, action) {
            angular.forEach(mapProvider.zoomLevels, function(zoomLevel, zoomLevelId) {
              angular.forEach(zoomLevel, function(marker, id) {
                if (mapProvider.isMarkerInsideBounds(marker))
                {
                  if (marker.item.inventory_category_id === inventoryId)
                  {
                    if (action === 'show')
                    {
                      marker.setVisible(true);
                    };

                    if (action === 'hide')
                    {
                      marker.setVisible(false);
                    };
                  }
                }
              });
            });
          }
        };

        mapProvider.start();

        // bind to $rootScope
        $rootScope.map = mapProvider.map;
        $rootScope.filterItemsByInventoryId = mapProvider.filterItems;
        $rootScope.filterByReportCategory = mapProvider.filterReports;
      }
    };
  });
