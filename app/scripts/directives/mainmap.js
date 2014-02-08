/* global $, google */
/* jshint camelcase: false, -W083 */
'use strict';

angular.module('zupWebAngularApp')
  .directive('mainMap', function (Reports, $rootScope, $compile, $timeout) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var styles = [{}, {'featureType': 'poi.business', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] },{ 'featureType': 'poi.government', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.medical', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.place_of_worship', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.school', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.sports_complex', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'transit', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }, { 'saturation': -100 }, { 'lightness': 42 }] }, { 'featureType': 'road.highway', 'elementType': 'geometry.fill', 'stylers': [{ 'saturation': -100 }, { 'lightness': 47 }] }, { 'featureType': 'landscape', 'stylers': [{ 'lightness': 82 }, { 'saturation': -100 }] }, { 'featureType': 'water', 'stylers': [{ 'hue': '#00b2ff' }, { 'saturation': -21 }, { 'lightness': -4 }] }, { 'featureType': 'poi', 'stylers': [{ 'lightness': 19 }, { 'weight': 0.1 }, { 'saturation': -22 }] }, { 'elementType': 'geometry.fill', 'stylers': [{ 'visibility': 'on' }, { 'lightness': 18 }] }, { 'elementType': 'labels.text', 'stylers': [{ 'saturation': -100 }, { 'lightness': 28 }] }, { 'featureType': 'poi.attraction', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'poi.park', 'elementType': 'geometry.fill', 'stylers': [{ 'saturation': 12 }, { 'lightness': 25 }] }, { 'featureType': 'road', 'elementType': 'labels.icon', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'road', 'elementType': 'labels.text', 'stylers': [{ 'lightness': 30 }] }, { 'featureType': 'landscape.man_made', 'elementType': 'labels', 'stylers': [{ 'visibility': 'off' }] }, { 'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [{ 'saturation': -100 }, { 'lightness': 56 }] }, { 'featureType': 'road.local', 'elementType': 'geometry.fill', 'stylers': [{ 'lightness': 62 }] }, { 'featureType': 'landscape.man_made', 'elementType': 'geometry', 'stylers': [{ 'visibility': 'off' }] }];

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
            // Start showing items from 6 months ago to today
            var begin_date = new Date();
            begin_date.setHours(0, 0, 0, 0);
            begin_date = new Date(begin_date.getFullYear(), begin_date.getMonth() - 6, 1);
            begin_date = begin_date.toISOString();

            var end_date = new Date();
            end_date.setTime(end_date.getTime() + (24 * 60 * 60 * 1000));
            end_date = end_date.toISOString();

            // After we get everything that is needed to render the map...
            var params = {
              'position[latitude]': -23.549671,
              'position[longitude]': -46.6321713,
              'position[distance]': 100000,
              'max_items': 40,
              'begin_date': begin_date,
              'end_date': end_date
            };

            // FIXME Only use
            var getItems = function()
            {
              $rootScope.isLoadingMap = true;

              Reports.getItems(params, function(data) {
                for (var i = data.reports.length - 1; i >= 0; i--) {
                  var LatLng = new google.maps.LatLng(data.reports[i].position.latitude, data.reports[i].position.longitude);

                  var infowindow = new google.maps.InfoWindow(),
                      category = $rootScope.getReportCategory(data.reports[i].category_id);

                  var pin = new google.maps.Marker({
                      position: LatLng,
                      map: map,
                      animation: google.maps.Animation.DROP,
                      icon: category.marker.url,
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

            getItems();

            /* Watch for period changes */
            var currentTimeout = null;

            scope.$watch('itemsPeriod', function() {
              if (typeof scope.itemsPeriod !== 'undefined')
              {
                // Start loading
                $rootScope.isLoadingMap = true;

                // Hide every marker in the map
                for (var i = $rootScope.categories.length - 1; i >= 0; i--) {
                  angular.forEach($rootScope.markers.reports[$rootScope.categories[i].id], function(value, key){
                    value.setVisible(false);
                  });
                };

                params.begin_date = scope.itemsPeriod.beginDate;
                params.end_date = scope.itemsPeriod.endDate;

                if(currentTimeout) {
                  $timeout.cancel(currentTimeout);
                }

                currentTimeout = $timeout(function(){
                  getItems();
                }, 700);

                // Active all filters back
                angular.element('.sidebar_filter').addClass('active');
              }
            });
          }
        });

        $rootScope.map = map;
      }
    };
  });
