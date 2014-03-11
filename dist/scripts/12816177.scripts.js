"use strict";angular.module("zupWebAngularApp",["ngCookies","ngResource","ngSanitize","ngRoute","ui.bootstrap","ui.mask","angularFileUpload"]).config(["$routeProvider","$httpProvider",function(a,b){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/reports",{templateUrl:"views/reports.html",controller:"ReportsCtrl",access:{logged:!0}}).when("/reports/view/:reportId",{templateUrl:"views/reports.html",controller:"ReportsCtrl",access:{logged:!0}}).when("/account",{templateUrl:"views/account.html",controller:"AccountCtrl",access:{logged:!0}}).when("/statistics",{templateUrl:"views/statistics.html",controller:"StatisticsCtrl"}).otherwise({redirectTo:"/"}),b.interceptors.push(["$q","$injector",function(a,b){return{request:function(c){c.url=c.url.replace("{base_url}","http://staging.zup.sapience.io");var d=null;return b.invoke(["Auth",function(a){d=a.getToken()}]),c.headers["X-App-Token"]=d,c||a.when(c)},responseError:function(c){var d=c.config.expectedErrors;return("undefined"==typeof d||-1===d.indexOf(c.status))&&b.invoke(["Error",function(a){a.showDetails(c)}]),a.reject(c)}}}]),b.defaults.useXDomain=!0,delete b.defaults.headers.common["X-Requested-With"]}]).run(["$rootScope","$q","$location","Auth","$modal","Reports","Inventory",function(a,b,c,d,e,f,g){a.$on("$routeChangeStart",function(e,h,i){if("undefined"==typeof i){a.reportCategories={},a.inventoryCategories={},a.statuses=[],a.enabledReports=!0,a.isLoading=!0;var j=d.check();j.then(function(){a.logged=!0},function(){a.logged=!1,"undefined"!=typeof h.access&&h.access.logged===!0&&c.path("/")});var k=f.get({display_type:"full"},function(b){a.reportCategories=b.categories;for(var c=b.categories.length-1;c>=0;c--)for(var d=b.categories[c].statuses.length-1;d>=0;d--){for(var e=!1,f=a.statuses.length-1;f>=0;f--)a.statuses[f].id===b.categories[c].statuses[d].id&&(e=!0);e||a.statuses.push(b.categories[c].statuses[d])}0===b.categories.length&&(a.enabledReports=!1)}),l=g.get(function(b){a.inventoryCategories=b.categories});b.all([k.$promise,l.$promise,j.$promise]).then(function(){a.isLoading=!1})}"MainCtrl"===h.controller?a.page="main":"StatisticsCtrl"===h.controller?a.page="main":"ReportsCtrl"===h.controller?a.page="reports":"AccountCtrl"===h.controller&&(a.page="account")}),a.getReportCategory=function(b){for(var c=a.reportCategories.length-1;c>=0;c--)if(a.reportCategories[c].id===b)return a.reportCategories[c];return null},a.getInventoryCategory=function(b){for(var c=a.inventoryCategories.length-1;c>=0;c--)if(a.inventoryCategories[c].id===b)return a.inventoryCategories[c];return null},a.getItemsPeriodBySliderPosition=function(a){if(1==a){var b=new Date;b.setHours(0,0,0,0),b=new Date(b.getFullYear(),b.getMonth()-6,1),b=b.toISOString()}if(2==a){var b=new Date;b.setHours(0,0,0,0),b=new Date(b.getFullYear(),b.getMonth()-3,1),b=b.toISOString()}if(3==a){var b=new Date;b.setHours(0,0,0,0),b=new Date(b.getFullYear(),b.getMonth()-1,1),b=b.toISOString()}if(4==a){var b=new Date;b.setDate(b.getDate()-7),b=b.toISOString()}var c=new Date;return c.setTime(c.getTime()+864e5),c=c.toISOString(),{beginDate:b,endDate:c}},a.login=function(){e.open({templateUrl:"views/modal_login.html",windowClass:"modal_login",controller:["$scope","$rootScope","$modalInstance","User",function(a,b,c,d){a.inputs={},a.close=function(){c.close()},a.signup=function(){c.close(),b.signup()},a.login=function(){a.loginError=!1;var e=new d(a.inputs.email,a.inputs.password);e.auth().then(function(){b.logged=!0,c.close()},function(b){(400===b.status||401===b.status)&&(a.loginError=!0)})},a.forgot=function(){c.close(),b.forgot()}}]})},a.forgot=function(){e.open({templateUrl:"views/modal_forgot_password.html",windowClass:"modal_forgot",controller:["$scope","$modalInstance","Users","Alert",function(a,b,c,d){a.inputs={},a.close=function(){b.close()},a.send=function(){a.inputErrors={},a.processingForm=!0,c.recoverPassword({email:a.inputs.email},function(){b.close(),d.show("E-mail enviado","Um e-mail foi enviado a você com instruções para redefinir a sua senha.")},function(b){a.processingForm=!1,a.inputErrors=b.data.error})}}]})},a.signup=function(){e.open({templateUrl:"views/modal_signup.html",windowClass:"modal_signup",controller:["$scope","$modalInstance","Users","Alert",function(a,b,c,d){a.inputs={},a.close=function(){b.close()},a.register=function(){a.inputErrors={},a.processingForm=!0;var e=new c(a.inputs);e.$save(function(){b.close(),d.show("Parabéns!","Sua conta foi criada com sucesso. Agora você pode criar e verificar suas solicitações.")},function(b){a.processingForm=!1,a.inputErrors=b.data.error})}}]})},a.newReport=function(){e.open({templateUrl:"views/modal_new_report.html",windowClass:"modal_new_report",controller:["$scope","$modalInstance","Reports","Alert","$location","$fileUploader",function(a,c,d,e,f,g){a.inputs={description:null},a.itemId=null,a.categoryData=null,a.lat=null,a.lng=null,a.formattedAddress=null,a.policy=!1,a.close=function(){c.close()},a.selectCategory=function(b){a.categoryData=b};var h=a.uploader=g.create({scope:a});h.filters.push(function(a){var b=h.isHTML5?a.type:"/"+a.value.slice(a.value.lastIndexOf(".")+1);return b="|"+b.toLowerCase().slice(b.lastIndexOf("/")+1)+"|",-1!=="|jpg|png|jpeg|bmp|gif|".indexOf(b)}),a.send=function(){function g(a){var c=b.defer(),a=a,d=new FileReader;return d.addEventListener("load",function(a){var b=a.target;i.push(b.result.replace(/^data:image\/[^;]+;base64,/,"")),c.resolve()}),d.readAsDataURL(a),c.promise}a.inputErrors={},a.processingForm=!0;for(var i=[],j=[],k=h.queue.length-1;k>=0;k--)j.push(g(h.queue[k].file));b.all(j).then(function(){var b=new d({categoryId:a.categoryData.id,latitude:a.lat,longitude:a.lng,inventory_item_id:a.itemId,description:a.inputs.description,address:a.formattedAddress,images:i});b.$save(function(a){c.close(),e.show("Relato criado com sucesso","Solicitação enviada com sucesso. Agora você pode checar o status da sua solicitação no menu superior.",function(){f.path("/reports/view/"+a.report.id)})},function(b){a.processingForm=!1,a.inputErrors=b.data.error})})}}]})},a.viewReport=function(a,b){e.open({templateUrl:"views/modal_view_report.html",windowClass:"modal_view_report",resolve:{report:function(){return a},category:function(){return b}},controller:["$scope","$modalInstance","report","category",function(a,b,c,d){a.report=c,a.category=d,a.close=function(){b.close()};for(var e=d.statuses.length-1;e>=0;e--)d.statuses[e].id===c.status_id&&(a.status=d.statuses[e])}]})},a.viewItemWithReports=function(b){var c=b.inventory_item_id,d=b.inventory_item_category_id;g.getItem({id:c,categoryId:d},function(b){a.viewItem(b.item,a.getInventoryCategory(d),!0)})},a.viewItem=function(b,c,d){e.open({templateUrl:"views/modal_view_item.html",windowClass:"modal_view_item",resolve:{item:function(){return b},category:function(){return c}},controller:["$scope","$modalInstance","item","category","Reports",function(b,c,e,f,g){b.item=e,b.category=f,b.currentTab=0,d===!0&&(b.currentTab=1),b.getDataByInventoryFieldId=function(a){for(var b=e.data.length-1;b>=0;b--)if(e.data[b].inventory_field_id===a)return e.data[b].content},b.loadingReports=!0,g.getReportsByItem({itemId:e.id},function(c){for(var d=c.reports.length-1;d>=0;d--){c.reports[d].category=a.getReportCategory(c.reports[d].category_id),console.log(c.reports[d].category);for(var e=c.reports[d].category.statuses.length-1;e>=0;e--)c.reports[d].category.statuses[e].id===c.reports[d].status_id&&(c.reports[d].status=c.reports[d].category.statuses[e])}console.log(c),b.reports=c.reports,b.currentReport=c.reports[0],b.loadingReports=!1}),b.viewReport=function(a){b.currentReport=a},b.close=function(){c.close()}}]})},a.logout=function(){d.clearToken(),d.saveUser(null),a.logged=!1,c.path("/")}}]),angular.module("zupWebAngularApp").controller("MainCtrl",function(){}),angular.module("zupWebAngularApp").service("User",["$q","$http","Auth",function(a,b,c){return function(d,e){this.auth=function(){var f=a.defer(),g=b({method:"POST",url:"{base_url}/authenticate.json",data:{email:d,password:e},expectedErrors:[400,401]});return g.success(function(a){c.saveUser(a.user),c.saveToken(a.token),f.resolve()}),g.error(function(a,b,c,d){f.reject({data:a,status:b,config:d})}),f.promise}}}]),angular.module("zupWebAngularApp").factory("Auth",["$q","$http","$cookies","$rootScope",function(a,b,c,d){var e=null;return{check:function(){var c=a.defer(),d=this.getToken();if(null!==d&&null===e){var f=b({method:"GET",url:"{base_url}/me.json",headers:{"X-App-Token":d}}),g=this;f.success(function(a){g.saveUser(a.user),c.resolve()}),f.error(function(){c.reject(),g.clearToken()})}else null!==d&&null!==e?c.resolve():(c.reject(),this.clearToken());return c.promise},getToken:function(){var a=c.token;return"undefined"==typeof a?null:a},saveToken:function(a){c.token=a},clearToken:function(){delete c.token},saveUser:function(a){e=a,d.me=e},isLogged:function(){return null!==e&&null!==this.getToken()}}}]),angular.module("zupWebAngularApp").factory("Users",["$resource",function(a){return a("{base_url}/users/:id.json",{id:"@id"},{save:{method:"POST",expectedErrors:[400]},update:{method:"PUT",expectedErrors:[400]},getAll:{method:"GET"},recoverPassword:{url:"{base_url}/recover_password",method:"PUT",expectedErrors:[400]}})}]),angular.module("zupWebAngularApp").factory("Error",["$modal",function(a){return{showDetails:function(b){a.open({templateUrl:"views/modal_error.html",resolve:{response:function(){return b}},controller:["$scope","$modalInstance","response",function(a,b,c){a.response=c,a.ok=function(){window.location.reload()}}]})}}}]),angular.module("zupWebAngularApp").directive("genericInput",function(){return{restrict:"A",link:function(a,b){a.$watch("inputErrors",function(){var c=a.inputErrors,d=angular.element("label[for='"+b.attr("id")+"']");if(b.removeClass("has-error"),d.removeClass("has-error"),"undefined"!=typeof c)for(var e in c)e===b.attr("name")&&(b.addClass("has-error"),d.addClass("has-error"))}),a.$parent.$watch("processingForm",function(){a.$parent.processingForm===!0?b.attr("disabled",!0):b.attr("disabled",!1)})}}}),angular.module("zupWebAngularApp").factory("Alert",["$modal",function(a){return{show:function(b,c,d){a.open({templateUrl:"views/modal_alert.html",windowClass:"modal_alert",resolve:{text:function(){return{title:b,message:c}}},controller:["$scope","$modalInstance","text",function(a,b,c){a.title=c.title,a.message=c.message,a.close="undefined"==typeof d?function(){b.close()}:function(){d(),b.close()}}]})}}}]),angular.module("zupWebAngularApp").factory("Reports",["$resource",function(a){return a("{base_url}/reports/categories/:id.json",{id:"@id"},{getItemsByCategory:{url:"{base_url}/reports/:categoryId/items.json",method:"GET",params:{categoryId:"@categoryId"}},getItems:{url:"{base_url}/reports/items/:id.json",method:"GET",params:{id:"@id"}},save:{url:"{base_url}/reports/:categoryId/items.json",method:"POST",params:{categoryId:"@categoryId"}},getMyItems:{url:"{base_url}/reports/users/me/items.json",method:"GET"},getReportsByItem:{url:"{base_url}/reports/inventory/:itemId/items.json",method:"GET",params:{itemId:"@itemId"}},getStats:{url:"{base_url}/reports/stats.json",method:"GET"}})}]),angular.module("zupWebAngularApp").directive("reportCategoryIcon",function(){return{restrict:"A",link:function(a,b){b.click(function(){angular.element(".report_filter").removeClass("active"),b.addClass("active")})}}}),angular.module("zupWebAngularApp").directive("reportMap",["$timeout","$q","$rootScope","Inventory","$compile",function(a,b,c,d){return{restrict:"A",link:function(e,f){var g={options:{styles:[{},{featureType:"poi.business",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.government",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.medical",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.place_of_worship",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.school",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.sports_complex",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"transit",elementType:"labels",stylers:[{visibility:"off"},{saturation:-100},{lightness:42}]},{featureType:"road.highway",elementType:"geometry.fill",stylers:[{saturation:-100},{lightness:47}]},{featureType:"landscape",stylers:[{lightness:82},{saturation:-100}]},{featureType:"water",stylers:[{hue:"#00b2ff"},{saturation:-21},{lightness:-4}]},{featureType:"poi",stylers:[{lightness:19},{weight:.1},{saturation:-22}]},{elementType:"geometry.fill",stylers:[{visibility:"on"},{lightness:18}]},{elementType:"labels.text",stylers:[{saturation:-100},{lightness:28}]},{featureType:"poi.attraction",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.park",elementType:"geometry.fill",stylers:[{saturation:12},{lightness:25}]},{featureType:"road",elementType:"labels.icon",stylers:[{visibility:"off"}]},{featureType:"road",elementType:"labels.text",stylers:[{lightness:30}]},{featureType:"landscape.man_made",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"road.highway",elementType:"geometry",stylers:[{saturation:-100},{lightness:56}]},{featureType:"road.local",elementType:"geometry.fill",stylers:[{lightness:62}]},{featureType:"landscape.man_made",elementType:"geometry",stylers:[{visibility:"off"}]}],homeLatlng:new google.maps.LatLng(-23.549671,-46.6321713),map:{zoom:11,scrollwheel:!1,mapTypeControl:!1,mapTypeControlOptions:{mapTypeIds:[google.maps.MapTypeId.ROADMAP,"zup"]}}},zoomLevels:{},currentZoom:11,map:null,getNewItemsTimeout:null,hideNotVisibleMarkersTimeout:null,doAnimation:!0,activeMethod:"reports",activeInventoryFilters:[],hiddenReportsCategories:[],hiddenInventoryCategories:[],mainMarker:null,allows_arbitrary_position:!0,start:function(){this.createMap(),this.setListeners()},createMap:function(){this.zoomLevels={},this.currentZoom=11;var a=new google.maps.StyledMapType(this.options.styles,{name:"zup"});this.map=new google.maps.Map(f[0],this.options.map),this.map.mapTypes.set("zup",a),this.map.setMapTypeId("zup"),this.map.setCenter(this.options.homeLatlng)},setListeners:function(){e.$watch("categoryData",function(){g.createMap(),setTimeout(function(){if(google.maps.event.trigger(g.map,"resize"),google.maps.event.trigger(g.map,"bounds_changed"),g.map.setCenter(g.options.homeLatlng),null!==e.$parent.categoryData)if(0==e.$parent.categoryData.inventory_categories.length){var a=new google.maps.MarkerImage(e.$parent.categoryData.marker.retina.web,null,null,null,new google.maps.Size(54,51)),b=new google.maps.Marker({map:g.map,draggable:!0,animation:google.maps.Animation.DROP,position:g.options.homeLatlng,icon:a});g.mainMarker=b,g.allows_arbitrary_position=!0,e.$apply(),google.maps.event.addListener(b,"dragend",function(){g.changedMarkerPosition(g.mainMarker.getPosition().lat(),g.mainMarker.getPosition().lng())})}else google.maps.event.addListener(g.map,"bounds_changed",function(){g.boundsChanged()}),google.maps.event.trigger(g.map,"bounds_changed"),g.allows_arbitrary_position=!1,g.mainMarker=null,e.$apply();e.$parent.lat=null,e.$parent.lng=null,e.$parent.itemId=null,e.$parent.formattedAddress=null,e.$apply()},80)})},changedMarkerPosition:function(a,b,c){var d=new google.maps.Geocoder;"undefined"==typeof c?(e.$parent.lat=a,e.$parent.lng=b):e.$parent.itemId=c,d.geocode({latLng:new google.maps.LatLng(a,b)},function(a,b){b===google.maps.GeocoderStatus.OK&&(e.$parent.formattedAddress=a[0].formatted_address,e.$apply())})},getItems:function(a){for(var b=[],c=e.$parent.categoryData.inventory_categories.length-1;c>=0;c--)b.push(e.$parent.categoryData.inventory_categories[c].id);var f={"position[latitude]":a.center.lat(),"position[longitude]":a.center.lng(),"position[distance]":a.distance,limit:80,zoom:g.map.getZoom(),inventory_category_id:b.join()},h=d.getItems(f);return h},boundsChanged:function(){var d=!1;"undefined"==typeof this.zoomLevels[this.map.getZoom()]&&(this.zoomLevels[this.map.getZoom()]={}),this.currentZoom!==this.map.getZoom()&&(d=!0,this.currentZoom=this.map.getZoom()),this.hideNotVisibleMarkersTimeout&&a.cancel(this.hideNotVisibleMarkersTimeout),this.hideNotVisibleMarkersTimeout=a(function(){g.hideNotVisibleMarkers()},200),this.getNewItemsTimeout&&a.cancel(this.getNewItemsTimeout),c.isLoadingItems=!0,this.getNewItemsTimeout=a(function(){var a=g.getItems({center:g.map.getCenter(),distance:g.getDistance(),limit:100});b.all([a.$promise]).then(function(a){c.isLoadingItems=!1,d&&g.hideAllMarkersFromInactiveLevels();for(var b=a[0].items.length-1;b>=0;b--)g.addMarker(a[0].items[b],g.doAnimation,"item");g.doAnimation===!0&&(g.doAnimation=!1)})},1e3)},hideNotVisibleMarkers:function(){angular.forEach(this.zoomLevels[this.map.getZoom()],function(a){if(g.isMarkerInsideBounds(a)){var b;"report"===a.type&&(b=g.hiddenReportsCategories.indexOf(a.item.category_id)),"item"===a.type&&(b=g.hiddenInventoryCategories.indexOf(a.item.inventory_category_id)),~b||a.setVisible(!0)}else a.setVisible(!1)})},hideAllMarkersFromInactiveLevels:function(){angular.forEach(this.zoomLevels,function(a,b){console.log(b,g.currentZoom),b!=g.currentZoom&&angular.forEach(a,function(a){a.setVisible(!1)})})},isMarkerInsideBounds:function(a){return this.map.getBounds().contains(a.getPosition())},addMarker:function(a,b,d){if("undefined"==typeof this.zoomLevels[this.map.getZoom()][d+"_"+a.id]){var f=new google.maps.LatLng(a.position.latitude,a.position.longitude),h=(new google.maps.InfoWindow,c.getInventoryCategory(a.inventory_category_id)),i=new google.maps.Size(15,15),j=(c.viewItem,"item"),k=(g.hiddenInventoryCategories.indexOf(a.inventory_category_id),new google.maps.MarkerImage(h.pin.retina.web,null,null,null,i)),l={position:f,map:this.map,icon:k,category:h,item:a,type:j};"undefined"!=typeof b&&b===!0&&(l.animation=google.maps.Animation.DROP);var m=new google.maps.Marker(l);this.zoomLevels[this.map.getZoom()][d+"_"+a.id]=m,google.maps.event.addListener(m,"click",function(){var a=new google.maps.LatLng(this.item.position.latitude,this.item.position.longitude);if(g.changedMarkerPosition(this.item.position.latitude,this.item.position.longitude,this.item.id),null===g.mainMarker){var b=new google.maps.MarkerImage(e.$parent.categoryData.marker.retina.web,null,null,null,new google.maps.Size(54,51)),c=new google.maps.Marker({map:g.map,animation:google.maps.Animation.DROP,position:a,icon:b});g.mainMarker=c}else g.mainMarker.setPosition(a)})}},getDistance:function(){var a=this.map.getBounds(),b=a.getCenter(),c=a.getNorthEast(),d=google.maps.geometry.spherical.computeDistanceBetween(b,c);return d}};g.start(),e.mapProvider=g}}}]),angular.module("zupWebAngularApp").directive("mainMap",["Reports","$rootScope","$compile","$timeout","Inventory","$q","$window",function(a,b,c,d,e,f){return{restrict:"A",link:function(g,h){var i={options:{styles:[{},{featureType:"poi.business",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.government",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.medical",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.place_of_worship",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.school",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.sports_complex",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"transit",elementType:"labels",stylers:[{visibility:"off"},{saturation:-100},{lightness:42}]},{featureType:"road.highway",elementType:"geometry.fill",stylers:[{saturation:-100},{lightness:47}]},{featureType:"landscape",stylers:[{lightness:82},{saturation:-100}]},{featureType:"water",stylers:[{hue:"#00b2ff"},{saturation:-21},{lightness:-4}]},{featureType:"poi",stylers:[{lightness:19},{weight:.1},{saturation:-22}]},{elementType:"geometry.fill",stylers:[{visibility:"on"},{lightness:18}]},{elementType:"labels.text",stylers:[{saturation:-100},{lightness:28}]},{featureType:"poi.attraction",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.park",elementType:"geometry.fill",stylers:[{saturation:12},{lightness:25}]},{featureType:"road",elementType:"labels.icon",stylers:[{visibility:"off"}]},{featureType:"road",elementType:"labels.text",stylers:[{lightness:30}]},{featureType:"landscape.man_made",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"road.highway",elementType:"geometry",stylers:[{saturation:-100},{lightness:56}]},{featureType:"road.local",elementType:"geometry.fill",stylers:[{lightness:62}]},{featureType:"landscape.man_made",elementType:"geometry",stylers:[{visibility:"off"}]}],homeLatlng:new google.maps.LatLng(-23.549671,-46.6321713),map:{zoom:11,mapTypeControl:!1,panControl:!0,panControlOptions:{position:google.maps.ControlPosition.TOP_RIGHT},zoomControl:!0,zoomControlOptions:{position:google.maps.ControlPosition.TOP_RIGHT},scaleControl:!0,scaleControlOptions:{position:google.maps.ControlPosition.TOP_RIGHT},streetViewControl:!0,streetViewControlOptions:{position:google.maps.ControlPosition.TOP_RIGHT}}},zoomLevels:{},currentZoom:11,map:null,getNewItemsTimeout:null,hideNotVisibleMarkersTimeout:null,doAnimation:!0,activeMethod:"reports",activeInventoryFilters:[],hiddenReportsCategories:[],hiddenInventoryCategories:[],infoWindow:new google.maps.InfoWindow,currentReportFilterStatus:null,beginDate:null,endDate:null,start:function(){i.resize(),g.readyToFilterInventoryItems=!1,b.$watch("inventoryCategories",function(){if("undefined"!=typeof b.inventoryCategories)for(var a=b.inventoryCategories.length-1;a>=0;a--)i.hiddenInventoryCategories.push(b.inventoryCategories[a].id)});var a=b.getItemsPeriodBySliderPosition(1);this.beginDate=a.beginDate,this.endDate=a.endDate,this.createMap(),this.setListeners()},resize:function(){h.css({width:$(window).width()-300,height:$(window).height()-70})},createMap:function(){var a=new google.maps.StyledMapType(this.options.styles,{name:"zup"});this.map=new google.maps.Map(h[0],this.options.map),this.map.mapTypes.set("zup",a),this.map.setMapTypeId("zup"),this.map.setCenter(this.options.homeLatlng)},setListeners:function(){google.maps.event.addListener(this.map,"bounds_changed",function(){i.boundsChanged()}),$(window).resize(function(){i.resize()})},getReports:function(b){var c={"position[latitude]":b.center.lat(),"position[longitude]":b.center.lng(),"position[distance]":b.distance,limit:80,zoom:i.map.getZoom(),begin_date:i.beginDate,end_date:i.endDate};null!==i.currentReportFilterStatus&&(c.statuses=i.currentReportFilterStatus);var d=a.getItems(c);return d},getItems:function(a){var b={"position[latitude]":a.center.lat(),"position[longitude]":a.center.lng(),"position[distance]":a.distance,limit:30,zoom:i.map.getZoom()},c=e.getItems(b);return c},boundsChanged:function(a){var c=!1;"undefined"==typeof this.zoomLevels[this.map.getZoom()]&&(this.zoomLevels[this.map.getZoom()]={}),this.currentZoom!==this.map.getZoom()&&(c=!0,this.currentZoom=this.map.getZoom()),this.hideNotVisibleMarkersTimeout&&d.cancel(this.hideNotVisibleMarkersTimeout),this.hideNotVisibleMarkersTimeout=d(function(){i.hideNotVisibleMarkers()},200),this.getNewItemsTimeout&&d.cancel(this.getNewItemsTimeout),b.isLoadingItems=!0,this.getNewItemsTimeout=d(function(){var d=i.getReports({center:i.map.getCenter(),distance:i.getDistance(),limit:100}),e=i.getItems({center:i.map.getCenter(),distance:i.getDistance(),limit:100});f.all([d.$promise,e.$promise]).then(function(d){b.isLoadingItems=!1,a===!0&&i.removeAllMarkers(),c&&i.hideAllMarkersFromInactiveLevels();for(var e=d[0].reports.length-1;e>=0;e--)i.addMarker(d[0].reports[e],i.doAnimation,"report");for(var e=d[1].items.length-1;e>=0;e--)i.addMarker(d[1].items[e],i.doAnimation,"items");i.doAnimation===!0&&(i.doAnimation=!1)})},1e3)},hideNotVisibleMarkers:function(){angular.forEach(this.zoomLevels[this.map.getZoom()],function(a){if(i.isMarkerInsideBounds(a)){var b;"report"===a.type&&(b=i.hiddenReportsCategories.indexOf(a.item.category_id)),"item"===a.type&&(b=i.hiddenInventoryCategories.indexOf(a.item.inventory_category_id)),~b||a.setVisible(!0)}else a.setVisible(!1)})},hideAllMarkersFromInactiveLevels:function(){angular.forEach(this.zoomLevels,function(a,b){b!=i.currentZoom&&angular.forEach(a,function(a){a.setVisible(!1)})})},removeAllMarkers:function(){angular.forEach(this.zoomLevels,function(a,b){angular.forEach(a,function(a,c){a.setMap(null),delete i.zoomLevels[b][c]})})},isMarkerInsideBounds:function(a){return this.map.getBounds().contains(a.getPosition())},addMarker:function(a,d,e){if("undefined"==typeof this.zoomLevels[this.map.getZoom()][e+"_"+a.id]){var f,h,j,k,l=new google.maps.LatLng(a.position.latitude,a.position.longitude),m=i.infoWindow,n=!1;if("report"===e){f=b.getReportCategory(a.category_id),h=new google.maps.Size(54,51),j=b.viewReport,k="report";var o=i.hiddenReportsCategories.indexOf(a.category_id);~o||(n=!0),null!==a.inventory_item_id&&(j=b.viewItemWithReports)}else{f=b.getInventoryCategory(a.inventory_category_id),h=new google.maps.Size(15,15),j=b.viewItem,k="item";var o=i.hiddenInventoryCategories.indexOf(a.inventory_category_id);~o||(n=!0)}var p=new google.maps.MarkerImage(f.marker.retina.web,null,null,null,h),q={position:l,map:this.map,icon:p,category:f,item:a,type:k};"undefined"!=typeof d&&d===!0&&(q.animation=google.maps.Animation.DROP);var r=new google.maps.Marker(q);n||r.setVisible(!1),this.zoomLevels[this.map.getZoom()][e+"_"+a.id]=r,google.maps.event.addListener(r,"click",function(){var a='<div class="pinTooltip"><h1>{{category.title}}</h1><p>Enviada {{ item.created_at | date: \'dd/MM/yy HH:mm\'}}</p><a href="" ng-click="view(item, category)">Ver detalhes</a></div>',b=g.$new(!0);b.category=this.category,b.item=this.item,b.view=j;var d=c(a)(b);b.$apply(),m.setContent(d[0]),m.open(i.map,this)})}},getDistance:function(){var a=this.map.getBounds(),b=a.getCenter(),c=a.getNorthEast(),d=google.maps.geometry.spherical.computeDistanceBetween(b,c);return d},filterReportsByStatus:function(a){i.currentReportFilterStatus=b.activeStatus=a,i.boundsChanged(!0)},filterReportsByPeriod:function(a){i.beginDate=a.beginDate,i.endDate=a.endDate,i.boundsChanged(!0)},filterOneCategory:function(a){for(var c=b.inventoryCategories.length-1;c>=0;c--)b.inventoryCategories[c].id==a?i.filterItems(a):~i.hiddenInventoryCategories.indexOf(b.inventoryCategories[c].id)||i.filterItems(b.inventoryCategories[c].id)},filterItems:function(a,b){b!==!0&&i.hideAllReports();var c=i.hiddenInventoryCategories.indexOf(a);~c?(i.toggleItemsVisibility(a,"show"),i.hiddenInventoryCategories.splice(c,1)):(i.toggleItemsVisibility(a,"hide"),i.hiddenInventoryCategories.push(a))},filterReports:function(a,b){b!==!0&&i.hideAllItems();var c=i.hiddenReportsCategories.indexOf(a);~c?(i.toggleReportCategoryVisibility(a,"show"),i.hiddenReportsCategories.splice(c,1)):(i.toggleReportCategoryVisibility(a,"hide"),i.hiddenReportsCategories.push(a))},hideAllItems:function(){for(var a=b.inventoryCategories.length-1;a>=0;a--)~i.hiddenInventoryCategories.indexOf(b.inventoryCategories[a].id)||i.filterItems(b.inventoryCategories[a].id,!0)},hideAllReports:function(){for(var a=b.reportCategories.length-1;a>=0;a--)~i.hiddenReportsCategories.indexOf(b.reportCategories[a].id)||i.filterReports(b.reportCategories[a].id,!0)},toggleReportCategoryVisibility:function(a,b){angular.forEach(i.zoomLevels,function(c){angular.forEach(c,function(c){c.item.category_id===a&&("show"===b&&c.setVisible(!0),"hide"===b&&c.setVisible(!1))})})},toggleItemsVisibility:function(a,b){angular.forEach(i.zoomLevels,function(c){angular.forEach(c,function(c){c.item.inventory_category_id===a&&("show"===b&&c.setVisible(!0),"hide"===b&&c.setVisible(!1))})})}};i.start(),b.map=i.map,b.filterItemsByInventoryId=i.filterOneCategory,b.filterByReportCategory=i.filterReports,b.filterReportsByStatus=i.filterReportsByStatus,b.activeStatus=i.currentReportFilterStatus,b.filterReportsByPeriod=i.filterReportsByPeriod}}}]),angular.module("zupWebAngularApp").directive("filterReportsCategory",function(){return{restrict:"A",link:function(a,b){b.click(function(){$(".inventory_category_icon").each(function(){var a=angular.element(this).scope();$(this).find("span.image").css("background-image","url("+a.category.icon.retina.web.disabled+")"),$(this).removeClass("active")}),b.toggleClass("active")})}}}),angular.module("zupWebAngularApp").controller("ReportsCtrl",["$scope","Reports","$routeParams",function(a,b,c){var d=c.reportId;a.loadingReports=!0,b.getMyItems(function(b){var c=a.reports=b.reports;if(a.currentReport=b.reports[0],"undefined"!=typeof d)for(var e=c.length-1;e>=0;e--)c[e].id==d&&(a.currentReport=c[e]);a.loadingReports=!1}),a.viewReport=function(b){a.currentReport=b}}]),angular.module("zupWebAngularApp").controller("AccountCtrl",["$scope","Alert","Users",function(a,b,c){a.inputs={},a.submit=function(){a.inputErrors={},a.processingForm=!0,c.update(a.me,function(){a.processingForm=!1,b.show("Parabéns!","Dados atualizados com sucesso.")},function(b){a.processingForm=!1,a.inputErrors=b.data.error})}}]),angular.module("zupWebAngularApp").directive("changeBodyStyle",function(){return{restrict:"A",link:function(a,b){a.$watch("page",function(){"reports"===a.page||"account"===a.page?b.addClass("account"):b.removeClass("account")})}}}),angular.module("zupWebAngularApp").directive("searchMap",["$rootScope",function(a){return{restrict:"A",link:function(b,c){var d=a.map,e={types:["geocode"],componentRestrictions:{country:"br"}},f=new google.maps.places.SearchBox(c[0],e);f.bindTo("bounds",d);var g=new google.maps.Marker({map:d});google.maps.event.addListener(f,"places_changed",function(){g.setVisible(!1);var a=f.getPlaces()[0];a.geometry&&(a.geometry.viewport?d.fitBounds(a.geometry.viewport):(d.setCenter(a.geometry.location),d.setZoom(17)),g.setIcon({url:a.icon,size:new google.maps.Size(71,71),origin:new google.maps.Point(0,0),anchor:new google.maps.Point(17,34),scaledSize:new google.maps.Size(35,35)}),g.setPosition(a.geometry.location),g.setVisible(!0))});var h=d.getStreetView();google.maps.event.addListener(h,"visible_changed",function(){h.getVisible()?c.hide():c.show()})}}}]),angular.module("zupWebAngularApp").directive("searchReportMap",function(){return{restrict:"A",link:function(a,b){google.maps.event.clearListeners(a.mapProvider.map);var c={types:["geocode"],componentRestrictions:{country:"br"}},d=new google.maps.places.Autocomplete(b[0],c);d.bindTo("bounds",a.mapProvider.map),google.maps.event.addListener(d,"place_changed",function(){var b=d.getPlace();if(b.geometry)if(b.geometry.viewport?a.mapProvider.map.fitBounds(b.geometry.viewport):(a.mapProvider.map.setCenter(b.geometry.location),a.mapProvider.map.setZoom(17)),1==a.mapProvider.allows_arbitrary_position)a.mapProvider.mainMarker.setPosition(b.geometry.location),a.mapProvider.changedMarkerPosition(b.geometry.location.lat(),b.geometry.location.lng());else{var c=new google.maps.Marker({map:a.mapProvider.map,position:b.geometry.location});c.setIcon({url:b.icon,size:new google.maps.Size(71,71),origin:new google.maps.Point(0,0),anchor:new google.maps.Point(17,34),scaledSize:new google.maps.Size(35,35)})}})}}}),angular.module("zupWebAngularApp").directive("sliderFilter",function(){return{restrict:"A",link:function(a,b){$(b).slider({value:1,min:1,max:4,step:1,stop:function(b,c){a.filterReportsByPeriod(a.getItemsPeriodBySliderPosition(c.value))}})}}}),angular.module("zupWebAngularApp").directive("ngThumb",["$window",function(a){var b={support:!(!a.FileReader||!a.CanvasRenderingContext2D),isFile:function(b){return angular.isObject(b)&&b instanceof a.File},isImage:function(a){var b="|"+a.type.slice(a.type.lastIndexOf("/")+1)+"|";return-1!=="|jpg|png|jpeg|bmp|gif|".indexOf(b)}};return{restrict:"A",template:"<canvas/>",link:function(a,c,d){function e(a){var b=new Image;b.onload=f,b.src=a.target.result}function f(){var a=g.width||this.width/this.height*g.height,b=g.height||this.height/this.width*g.width;h.attr({width:a,height:b}),h[0].getContext("2d").drawImage(this,0,0,a,b)}if(b.support){var g=a.$eval(d.ngThumb);
if(b.isFile(g.file)&&b.isImage(g.file)){var h=c.find("canvas"),i=new FileReader;i.onload=e,i.readAsDataURL(g.file)}}}}}]),angular.module("zupWebAngularApp").controller("StatisticsCtrl",["$scope","$rootScope","Reports",function(a,b,c){var d={statuses:[],beginDate:null,endDate:null,totalCount:0,start:function(){var a=b.getItemsPeriodBySliderPosition(1);this.beginDate=a.beginDate,this.endDate=a.endDate,this.getStats()},getStats:function(){b.isLoading=!0;var a={begin_date:d.beginDate,end_date:d.endDate};c.getStats(a,function(a){d.organizeData(a.stats),b.isLoading=!1})},organizeData:function(b){d.statuses=[],d.totalCount=0;for(var c=b.length-1;c>=0;c--)for(var e=b[c].statuses.length-1;e>=0;e--){for(var f=!1,g=d.statuses.length-1;g>=0;g--)d.statuses[g].status_id===b[c].statuses[e].status_id&&(f=!0,d.statuses[g].count+=b[c].statuses[e].count);f||(d.totalCount+=b[c].statuses[e].count,b[c].statuses[e].percentage=100*b[c].statuses[e].count/d.totalCount,d.statuses.push(b[c].statuses[e]))}a.statuses=this.statuses},filterReportsByPeriod:function(a){d.beginDate=a.beginDate,d.endDate=a.endDate,d.getStats()}};a.filterReportsByPeriod=d.filterReportsByPeriod,d.start()}]),angular.module("zupWebAngularApp").directive("knob",function(){return{restrict:"A",link:function(a,b){b.knob({width:80,height:80,bgColor:"#eaeaea",thickness:".21",readOnly:!0,fontWeight:"700",inputColor:"#b2b2b2",fgColor:a.status.color,value:30}),a.$watch("status.percentage",function(){b.val(a.status.percentage).trigger("change")})}}}),angular.module("zupWebAngularApp").factory("Inventory",["$resource",function(a){return a("{base_url}/inventory/categories/:id.json",{id:"@id"},{getItems:{url:"{base_url}/inventory/items/:id.json",method:"GET",params:{id:"@id"}},getItem:{url:"{base_url}/inventory/categories/:categoryId/items/:id.json",method:"GET",params:{id:"@id",categoryId:"@categoryId"}}})}]),angular.module("zupWebAngularApp").directive("filterItems",function(){return{restrict:"A",link:function(a,b){var c=function(){b.find("span.image").css("background-image","url("+a.category.icon.retina.web.disabled+")")},d=function(){b.find("span.image").css("background-image","url("+a.category.icon.retina.web.active+")")};b.hover(function(){d()},function(){b.hasClass("active")||c()}),b.click(function(){$(".report_category_icon").removeClass("active"),$(".inventory_category_icon").each(function(){var a=angular.element(this).scope();$(this).find("span.image").css("background-image","url("+a.category.icon.retina.web.disabled+")"),$(this).removeClass("active")}),b.toggleClass("active"),b.hasClass("active")?d():c()}),c()}}});