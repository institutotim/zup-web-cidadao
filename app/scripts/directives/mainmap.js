/* global $, google */
/* jshint camelcase: false, -W083 */
'use strict';

angular.module('zupWebAngularApp')
  .directive('mainMap', function (Reports, $rootScope, $compile, $timeout, Inventory, $q, $window) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var mapProvider = {
          options:
          {
            styles: [{}, {'featureType': 'poi.business', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] },{ 'featureType': 'poi.government', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.medical', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.place_of_worship', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.school', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.sports_complex', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'transit', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }, { 'saturation': -100 }, { 'lightness': 42 }] }, { 'featureType': 'road.highway', 'elementType': 'geometry.fill', 'stylers': [{ 'saturation': -100 }, { 'lightness': 47 }] }, { 'featureType': 'landscape', 'stylers': [{ 'lightness': 82 }, { 'saturation': -100 }] }, { 'featureType': 'water', 'stylers': [{ 'hue': '#00b2ff' }, { 'saturation': -21 }, { 'lightness': -4 }] }, { 'featureType': 'poi', 'stylers': [{ 'lightness': 19 }, { 'weight': 0.1 }, { 'saturation': -22 }] }, { 'elementType': 'geometry.fill', 'stylers': [{ 'visibility': 'on' }, { 'lightness': 18 }] }, { 'elementType': 'labels.text', 'stylers': [{ 'saturation': -100 }, { 'lightness': 28 }] }, { 'featureType': 'poi.attraction', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.park', 'elementType': 'geometry.fill', 'stylers': [{ 'saturation': 12 }, { 'lightness': 25 }] }, { 'featureType': 'road', 'elementType': 'labels.icon', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'road', 'elementType': 'labels.text', 'stylers': [{ 'lightness': 30 }] }, { 'featureType': 'landscape.man_made', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [{ 'saturation': -100 }, { 'lightness': 56 }] }, { 'featureType': 'road.local', 'elementType': 'geometry.fill', 'stylers': [{ 'lightness': 62 }] }, { 'featureType': 'landscape.man_made', 'elementType': 'geometry', 'stylers': [{ 'visibility': 'off' }] }],
            homeLatlng: new google.maps.LatLng(-23.549671, -46.6321713),
            map: {
              zoom: 11,
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
          currentZoom: 11,
          map: null,
          getNewItemsTimeout: null,
          hideNotVisibleMarkersTimeout: null,
          doAnimation: true,
          activeMethod: 'reports', // or items
          activeInventoryFilters: [],
          hiddenReportsCategories: [],
          hiddenInventoryCategories: [],
          infoWindow: new google.maps.InfoWindow(),
          currentReportFilterStatus: null,
          beginDate: null,
          endDate: null,

          start: function() {
            mapProvider.resize();

            scope.readyToFilterInventoryItems = false;

            // populate hiddenInventoryCategories with all inventory categories
            $rootScope.$watch('inventoryCategories', function() {
              if (typeof $rootScope.inventoryCategories !== 'undefined')
              {
                for (var i = $rootScope.inventoryCategories.length - 1; i >= 0; i--) {
                  mapProvider.hiddenInventoryCategories.push($rootScope.inventoryCategories[i].id);
                };
              }
            });

            // set dates to first filter
            var period = $rootScope.getItemsPeriodBySliderPosition(1);

            this.beginDate = period.beginDate;
            this.endDate = period.endDate;

            // create map and set specific listeners
            this.createMap();
            this.setListeners();
          },

          resize: function() {
            element.css({'width': $(window).width() - 300, 'height': $(window).height() - 70 });
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

            $(window).resize(function() {
              mapProvider.resize();
            });
          },

          getReports: function(options, callback) {
            var params = {
              'position[latitude]': options.center.lat(),
              'position[longitude]': options.center.lng(),
              'position[distance]': options.distance,
              'limit': 80,
              'zoom': mapProvider.map.getZoom(),
              'begin_date': mapProvider.beginDate,
              'end_date': mapProvider.endDate
            };

            if (mapProvider.currentReportFilterStatus !== null)
            {
              params.statuses = mapProvider.currentReportFilterStatus;
            }

            var reportsData = Reports.getItems(params);

            return reportsData;
          },

          getItems: function(options, precallback) {
            var params = {
              'position[latitude]': options.center.lat(),
              'position[longitude]': options.center.lng(),
              'position[distance]': options.distance,
              'limit': 30,
              'zoom': mapProvider.map.getZoom()
            };

            var itemsData = Inventory.getItems(params);

            return itemsData;
          },

          boundsChanged: function(forceReset) {
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

                if (forceReset === true)
                {
                  mapProvider.removeAllMarkers();
                }

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
              if (zoomLevelId != mapProvider.currentZoom)
              {
                angular.forEach(zoomLevel, function(marker, id) {
                  marker.setVisible(false);
                });
              }
            });
          },

          removeAllMarkers: function() {
            angular.forEach(this.zoomLevels, function(zoomLevel, zoomLevelId) {
              angular.forEach(zoomLevel, function(marker, id) {
                marker.setMap(null);

                delete mapProvider.zoomLevels[zoomLevelId][id];
              });
            });
          },

          isMarkerInsideBounds: function(marker) {
            return this.map.getBounds().contains(marker.getPosition());
          },

          addMarker: function(item, effect, type) {
            if (typeof this.zoomLevels[this.map.getZoom()][type + '_' + item.id] === 'undefined')
            {
              var LatLng = new google.maps.LatLng(item.position.latitude, item.position.longitude);

              var infowindow = mapProvider.infoWindow;

              var category, iconSize, iconImg, viewAction, itemType, visibility = false;

              if (type === 'report')
              {
                category = $rootScope.getReportCategory(item.category_id);

                if (!category)
                {
                  return;
                }

                iconSize = new google.maps.Size(54, 51);
                iconImg = category.marker.retina.web;
                viewAction = $rootScope.viewReport;
                itemType = 'report';

                var pos = mapProvider.hiddenReportsCategories.indexOf(item.category_id);

                if (!~pos)
                {
                  visibility = true;
                }

                if (item.inventory_item_id !== null)
                {
                  viewAction = $rootScope.viewItemWithReports;
                }
              }
              else
              {
                category = $rootScope.getInventoryCategory(item.inventory_category_id);

                if (!category)
                {
                  return;
                }

                // check icon by category.plot_format
                if (category.plot_format === "marker")
                {
                  iconSize = new google.maps.Size(54, 51);
                  iconImg = category.marker.retina.web;
                }
                else
                {
                  iconSize = new google.maps.Size(15, 15);
                  iconImg = category.pin.retina.web;
                }

                viewAction = $rootScope.viewItem;
                itemType = 'item';

                var pos = mapProvider.hiddenInventoryCategories.indexOf(item.inventory_category_id);

                if (!~pos)
                {
                  visibility = true;
                }
              }

              var categoryIcon = new google.maps.MarkerImage(iconImg, null, null, null, iconSize);

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

          filterReportsByStatus: function(statusId) {
            // set status id
            mapProvider.currentReportFilterStatus = $rootScope.activeStatus = statusId;

            // force reload, now requests will search with the category id
            mapProvider.boundsChanged(true);
          },

          filterReportsByPeriod: function(period) {
            mapProvider.beginDate = period.beginDate;
            mapProvider.endDate = period.endDate;

            mapProvider.boundsChanged(true);
          },

          filterOneCategory: function(inventoryId) {
            for (var i = $rootScope.inventoryCategories.length - 1; i >= 0; i--) {
              if ($rootScope.inventoryCategories[i].id == inventoryId)
              {
                mapProvider.filterItems(inventoryId);
              }
              else
              {
                if (!~mapProvider.hiddenInventoryCategories.indexOf($rootScope.inventoryCategories[i].id))
                {
                  mapProvider.filterItems($rootScope.inventoryCategories[i].id);
                }
              }
            };
          },

          filterItems: function(inventoryId, hideAll) {
            if (hideAll !== true)
            {
              mapProvider.hideAllReports();
            }

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

          filterReports: function(reportCategoryId, hideAll) {
            if (hideAll !== true)
            {
              mapProvider.hideAllItems();
            }

            var pos = mapProvider.hiddenReportsCategories.indexOf(reportCategoryId);

            var subcategories = $rootScope.getReportCategory(reportCategoryId).subcategories;

            if (~pos)
            {
              mapProvider.toggleReportCategoryVisibility(reportCategoryId, 'show');
              mapProvider.hiddenReportsCategories.splice(pos, 1);

              if (reportCategoryId.length !== 0)
              {
                for (var i = subcategories.length - 1; i >= 0; i--) {
                  var subcategoryId = subcategories[i].id;

                  mapProvider.toggleReportCategoryVisibility(subcategoryId, 'show');

                  var p = mapProvider.hiddenReportsCategories.indexOf(subcategoryId);

                  if (~pos)
                  {
                    mapProvider.hiddenReportsCategories.splice(subcategoryId);
                  }
                };
              }
            }
            else
            {
              mapProvider.toggleReportCategoryVisibility(reportCategoryId, 'hide');
              mapProvider.hiddenReportsCategories.push(reportCategoryId);

              if (reportCategoryId.length !== 0)
              {
                for (var i = subcategories.length - 1; i >= 0; i--) {
                  var subcategoryId = subcategories[i].id;

                  mapProvider.toggleReportCategoryVisibility(subcategoryId, 'hide');
                  mapProvider.hiddenReportsCategories.push(subcategoryId);
                };
              }
            };
          },

          hideAllItems: function() {
            for (var i = $rootScope.inventoryCategories.length - 1; i >= 0; i--) {
              if (!~mapProvider.hiddenInventoryCategories.indexOf($rootScope.inventoryCategories[i].id))
              {
                mapProvider.filterItems($rootScope.inventoryCategories[i].id, true);
              }
            };
          },

          hideAllReports: function() {
            var idsToHide = [];

            for (var i = $rootScope.reportCategories.length - 1; i >= 0; i--) {
              if (!~mapProvider.hiddenReportsCategories.indexOf($rootScope.reportCategories[i].id))
              {
                idsToHide.push($rootScope.reportCategories[i].id);
              }

              if ($rootScope.reportCategories[i].subcategories.length !== 0)
              {
                for (var j = $rootScope.reportCategories[i].subcategories.length - 1; j >= 0; j--) {
                  if (!~mapProvider.hiddenReportsCategories.indexOf($rootScope.reportCategories[i].subcategories[j].id))
                  {
                    idsToHide.push($rootScope.reportCategories[i].subcategories[j].id);
                  }
                };
              }
            };

            for (var i = idsToHide.length - 1; i >= 0; i--) {
              mapProvider.filterReports(idsToHide[i], true);
            };
          },

          toggleReportCategoryVisibility: function(reportCategoryId, action) {
            angular.forEach(mapProvider.zoomLevels, function(zoomLevel, zoomLevelId) {
              angular.forEach(zoomLevel, function(marker, id) {
                //if (mapProvider.isMarkerInsideBounds(marker))
                //{
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
                //}
              });
            });
          },

          toggleItemsVisibility: function(inventoryId, action) {
            angular.forEach(mapProvider.zoomLevels, function(zoomLevel, zoomLevelId) {
              angular.forEach(zoomLevel, function(marker, id) {
                //if (mapProvider.isMarkerInsideBounds(marker))
                //{
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
                //}
              });
            });
          }
        };

        mapProvider.start();

        // bind to $rootScope
        $rootScope.map = mapProvider.map;
        $rootScope.filterItemsByInventoryId = mapProvider.filterOneCategory;
        $rootScope.filterByReportCategory = mapProvider.filterReports;
        $rootScope.filterReportsByStatus = mapProvider.filterReportsByStatus;
        $rootScope.activeStatus = mapProvider.currentReportFilterStatus;
        $rootScope.filterReportsByPeriod = mapProvider.filterReportsByPeriod;
      }
    };
  });
