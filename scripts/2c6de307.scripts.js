"use strict";angular.module("zupWebAngularApp",["ngCookies","ngResource","ngSanitize","ngRoute","ui.bootstrap","ui.mask"]).config(["$routeProvider","$httpProvider",function(a,b){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/reports",{templateUrl:"views/reports.html",controller:"ReportsCtrl",access:{logged:!0}}).when("/account",{templateUrl:"views/account.html",controller:"AccountCtrl",access:{logged:!0}}).otherwise({redirectTo:"/"}),b.interceptors.push(["$q","$injector",function(a,b){return{request:function(c){c.url=c.url.replace("{base_url}","http://staging.zup.sapience.io");var d=null;return b.invoke(["Auth",function(a){d=a.getToken()}]),c.headers["X-App-Token"]=d,c||a.when(c)},responseError:function(c){var d=c.config.expectedErrors;return("undefined"==typeof d||-1===d.indexOf(c.status))&&b.invoke(["Error",function(a){a.showDetails(c)}]),a.reject(c)}}}]),b.defaults.useXDomain=!0,delete b.defaults.headers.common["X-Requested-With"]}]).run(["$rootScope","$q","$location","Auth","$modal","Reports",function(a,b,c,d,e,f){a.$on("$routeChangeStart",function(e,g,h){if("undefined"==typeof h){a.markers={reports:{},items:{}},a.categories={},a.isLoading=!0;var i=d.check();i.then(function(){a.logged=!0},function(){a.logged=!1,"undefined"!=typeof g.access&&g.access.logged===!0&&c.path("/")});var j=f.get(function(b){a.categories=b.categories});b.all([j.$promise,i.$promise]).then(function(){for(var b=a.categories.length-1;b>=0;b--)a.markers.reports[a.categories[b].id]={};a.isLoading=!1})}"MainCtrl"===g.controller?a.page="main":"ReportsCtrl"===g.controller?a.page="reports":"AccountCtrl"===g.controller&&(a.page="account")}),a.getReportCategory=function(b){for(var c=a.categories.length-1;c>=0;c--)if(a.categories[c].id===b)return a.categories[c];return null},a.filterByReportCategory=function(b){for(var c in a.markers.reports)parseInt(c)===b.id&&angular.forEach(a.markers.reports[c],function(a){a.setVisible(a.getVisible()===!0?!1:!0)})},a.login=function(){e.open({templateUrl:"views/modal_login.html",windowClass:"modal_login",controller:["$scope","$rootScope","$modalInstance","User",function(a,b,c,d){a.inputs={},a.close=function(){c.close()},a.signup=function(){c.close(),b.signup()},a.login=function(){a.loginError=!1;var e=new d(a.inputs.email,a.inputs.password);e.auth().then(function(){b.logged=!0,c.close()},function(b){(400===b.status||401===b.status)&&(a.loginError=!0)})},a.forgot=function(){c.close(),b.forgot()}}]})},a.forgot=function(){e.open({templateUrl:"views/modal_forgot_password.html",windowClass:"modal_forgot",controller:["$scope","$modalInstance","Users","Alert",function(a,b,c,d){a.inputs={},a.close=function(){b.close()},a.send=function(){a.inputErrors={},a.processingForm=!0,c.recoverPassword({email:a.inputs.email},function(){b.close(),d.show("E-mail enviado","Um e-mail foi enviado a você com instruções para redefinir a sua senha.")},function(b){a.processingForm=!1,a.inputErrors=b.data.error})}}]})},a.signup=function(){e.open({templateUrl:"views/modal_signup.html",windowClass:"modal_signup",controller:["$scope","$modalInstance","Users","Alert",function(a,b,c,d){a.inputs={},a.close=function(){b.close()},a.register=function(){a.inputErrors={},a.processingForm=!0;var e=new c(a.inputs);e.$save(function(){b.close(),d.show("Parabéns!","Sua conta foi criada com sucesso. Agora você pode efetuar solicitações de limpeza de boca de lobo e para coletas de entulho.")},function(b){a.processingForm=!1,a.inputErrors=b.data.error})}}]})},a.newReport=function(){e.open({templateUrl:"views/modal_new_report.html",windowClass:"modal_new_report",controller:["$scope","$modalInstance","Reports","Alert","$route",function(a,b,c,d,e){a.inputs={description:null},a.categoryData=null,a.lat=null,a.lng=null,a.formattedAddress=null,a.policy=!1,a.close=function(){b.close()},a.selectCategory=function(b){a.categoryData=b},a.send=function(){a.inputErrors={},a.processingForm=!0;var f=new c({categoryId:a.categoryData.id,latitude:a.lat,longitude:a.lng,description:a.inputs.description,address:a.formattedAddress});f.$save(function(){b.close(),d.show("Relato criado com sucesso","Agora você pode checar o status do seu relato no menu superior.",function(){e.reload()})},function(b){a.processingForm=!1,a.inputErrors=b.data.error})}}]})},a.viewReport=function(a,b){e.open({templateUrl:"views/modal_view_report.html",windowClass:"modal_view_report",resolve:{report:function(){return a},category:function(){return b}},controller:["$scope","$modalInstance","report","category",function(a,b,c,d){a.report=c,a.category=d,a.close=function(){b.close()};for(var e=d.statuses.length-1;e>=0;e--)d.statuses[e].id===c.status_id&&(a.status=d.statuses[e])}]})},a.logout=function(){d.clearToken(),d.saveUser(null),a.logged=!1,c.path("/")}}]),angular.module("zupWebAngularApp").controller("MainCtrl",function(){}),angular.module("zupWebAngularApp").service("User",["$q","$http","Auth",function(a,b,c){return function(d,e){this.auth=function(){var f=a.defer(),g=b({method:"POST",url:"{base_url}/authenticate.json",data:{email:d,password:e},expectedErrors:[400,401]});return g.success(function(a){c.saveUser(a.user),c.saveToken(a.token),f.resolve()}),g.error(function(a,b,c,d){f.reject({data:a,status:b,config:d})}),f.promise}}}]),angular.module("zupWebAngularApp").factory("Auth",["$q","$http","$cookies","$rootScope",function(a,b,c,d){var e=null;return{check:function(){var c=a.defer(),d=this.getToken();if(null!==d&&null===e){var f=b({method:"GET",url:"{base_url}/me.json",headers:{"X-App-Token":d}}),g=this;f.success(function(a){g.saveUser(a.user),c.resolve()}),f.error(function(){c.reject(),g.clearToken()})}else null!==d&&null!==e?c.resolve():(c.reject(),this.clearToken());return c.promise},getToken:function(){var a=c.token;return"undefined"==typeof a?null:a},saveToken:function(a){c.token=a},clearToken:function(){delete c.token},saveUser:function(a){e=a,d.me=e},isLogged:function(){return null!==e&&null!==this.getToken()}}}]),angular.module("zupWebAngularApp").factory("Users",["$resource",function(a){return a("{base_url}/users/:id.json",{id:"@id"},{save:{method:"POST",expectedErrors:[400]},update:{method:"PUT",expectedErrors:[400]},getAll:{method:"GET"},recoverPassword:{url:"{base_url}/recover_password",method:"PUT",expectedErrors:[400]}})}]),angular.module("zupWebAngularApp").factory("Error",["$modal",function(a){return{showDetails:function(b){a.open({templateUrl:"views/modal_error.html",resolve:{response:function(){return b}},controller:["$scope","$modalInstance","response",function(a,b,c){a.response=c,a.ok=function(){window.location.reload()}}]})}}}]),angular.module("zupWebAngularApp").directive("genericInput",function(){return{restrict:"A",link:function(a,b){a.$parent.$watch("inputErrors",function(){var c=a.$parent.inputErrors,d=angular.element("label[for='"+b.attr("id")+"']");if(b.removeClass("has-error"),d.removeClass("has-error"),"undefined"!=typeof c)for(var e in c)e===b.attr("name")&&(console.log(e,c[e]),b.addClass("has-error"),d.addClass("has-error"))}),a.$parent.$watch("processingForm",function(){a.$parent.processingForm===!0?b.attr("disabled",!0):b.attr("disabled",!1)})}}}),angular.module("zupWebAngularApp").factory("Alert",["$modal",function(a){return{show:function(b,c,d){a.open({templateUrl:"views/modal_alert.html",windowClass:"modal_alert",resolve:{text:function(){return{title:b,message:c}}},controller:["$scope","$modalInstance","text",function(a,b,c){a.title=c.title,a.message=c.message,a.close="undefined"==typeof d?function(){b.close()}:function(){d(),b.close()}}]})}}}]),angular.module("zupWebAngularApp").factory("Reports",["$resource",function(a){return a("{base_url}/reports/categories/:id.json",{id:"@id"},{getItemsByCategory:{url:"{base_url}/reports/:categoryId/items.json",method:"GET",params:{categoryId:"@categoryId"}},getItems:{url:"{base_url}/reports/items/:id.json",method:"GET",params:{id:"@id"}},save:{url:"{base_url}/reports/:categoryId/items.json",method:"POST",params:{categoryId:"@categoryId"}},getMyItems:{url:"{base_url}/reports/users/me/items.json",method:"GET"}})}]),angular.module("zupWebAngularApp").directive("reportCategoryIcon",function(){return{restrict:"A",link:function(a,b){b.click(function(){angular.element(".report_filter").removeClass("active"),b.addClass("active")})}}}),angular.module("zupWebAngularApp").directive("reportMap",function(){return{restrict:"A",link:function(a,b){var c=[{},{featureType:"poi.business",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.government",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.medical",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.place_of_worship",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.school",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.sports_complex",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"transit",elementType:"labels",stylers:[{visibility:"off"},{saturation:-100},{lightness:42}]},{featureType:"road.highway",elementType:"geometry.fill",stylers:[{saturation:-100},{lightness:47}]},{featureType:"landscape",stylers:[{lightness:82},{saturation:-100}]},{featureType:"water",stylers:[{hue:"#00b2ff"},{saturation:-21},{lightness:-4}]},{featureType:"poi",stylers:[{lightness:19},{weight:.1},{saturation:-22}]},{elementType:"geometry.fill",stylers:[{visibility:"on"},{lightness:18}]},{elementType:"labels.text",stylers:[{saturation:-100},{lightness:28}]},{featureType:"poi.attraction",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.park",elementType:"geometry.fill",stylers:[{saturation:12},{lightness:25}]},{featureType:"road",elementType:"labels.icon",stylers:[{visibility:"off"}]},{featureType:"road",elementType:"labels.text",stylers:[{lightness:30}]},{featureType:"landscape.man_made",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"road.highway",elementType:"geometry",stylers:[{saturation:-100},{lightness:56}]},{featureType:"road.local",elementType:"geometry.fill",stylers:[{lightness:62}]},{featureType:"landscape.man_made",elementType:"geometry",stylers:[{visibility:"off"}]}],d=new google.maps.StyledMapType(c,{name:"zup"}),e=new google.maps.LatLng(-23.549671,-46.6321713),f={center:e,zoom:17,scrollwheel:!1,mapTypeControl:!1,mapTypeControlOptions:{mapTypeIds:[google.maps.MapTypeId.ROADMAP,"zup"]}},g=new google.maps.Map(b[0],f),h=new google.maps.Marker({map:g,draggable:!0,animation:google.maps.Animation.DROP,position:e});g.mapTypes.set("zup",d),g.setMapTypeId("zup");var i=function(){var b=new google.maps.Geocoder;a.$parent.lat=h.getPosition().lat(),a.$parent.lng=h.getPosition().lng(),b.geocode({latLng:h.getPosition()},function(b,c){c===google.maps.GeocoderStatus.OK&&(a.$parent.formattedAddress=b[0].formatted_address,a.$apply())})};google.maps.event.addListener(h,"dragend",function(){i()}),a.$watch("categoryData",function(){setTimeout(function(){google.maps.event.trigger(g,"resize"),google.maps.event.trigger(g,"bounds_changed"),g.setCenter(h.getPosition()),null!==a.$parent.categoryData&&h.setIcon(a.$parent.categoryData.marker.url),a.$parent.lat=null,a.$parent.lng=null,a.$parent.formattedAddress=null},80)}),a.reportMap=g,a.reportMarker=h,a.reportChangedMarkerPosition=i}}}),angular.module("zupWebAngularApp").directive("mainMap",["Reports","$rootScope","$compile","$timeout",function(a,b,c,d){return{restrict:"A",link:function(e,f){var g=[{},{featureType:"poi.business",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.government",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.medical",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.place_of_worship",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.school",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.sports_complex",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"transit",elementType:"labels",stylers:[{visibility:"off"},{saturation:-100},{lightness:42}]},{featureType:"road.highway",elementType:"geometry.fill",stylers:[{saturation:-100},{lightness:47}]},{featureType:"landscape",stylers:[{lightness:82},{saturation:-100}]},{featureType:"water",stylers:[{hue:"#00b2ff"},{saturation:-21},{lightness:-4}]},{featureType:"poi",stylers:[{lightness:19},{weight:.1},{saturation:-22}]},{elementType:"geometry.fill",stylers:[{visibility:"on"},{lightness:18}]},{elementType:"labels.text",stylers:[{saturation:-100},{lightness:28}]},{featureType:"poi.attraction",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.park",elementType:"geometry.fill",stylers:[{saturation:12},{lightness:25}]},{featureType:"road",elementType:"labels.icon",stylers:[{visibility:"off"}]},{featureType:"road",elementType:"labels.text",stylers:[{lightness:30}]},{featureType:"landscape.man_made",elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"road.highway",elementType:"geometry",stylers:[{saturation:-100},{lightness:56}]},{featureType:"road.local",elementType:"geometry.fill",stylers:[{lightness:62}]},{featureType:"landscape.man_made",elementType:"geometry",stylers:[{visibility:"off"}]}];f.css({width:$(window).width()-300,height:$(window).height()});var h=new google.maps.StyledMapType(g,{name:"zup"}),i=new google.maps.LatLng(-23.549671,-46.6321713),j={center:i,zoom:15,mapTypeControl:!1,panControl:!0,panControlOptions:{position:google.maps.ControlPosition.TOP_RIGHT},zoomControl:!0,zoomControlOptions:{position:google.maps.ControlPosition.TOP_RIGHT},scaleControl:!0,scaleControlOptions:{position:google.maps.ControlPosition.TOP_RIGHT},streetViewControl:!0,streetViewControlOptions:{position:google.maps.ControlPosition.TOP_RIGHT}},k=new google.maps.Map(f[0],j);k.mapTypes.set("zup",h),k.setMapTypeId("zup"),$(window).resize(function(){f.css({width:$(window).width()-300,height:$(window).height()})}),google.maps.event.addListener(k,"center_changed",function(){});e.$watch("isLoading",function(){if(e.isLoading===!1){var f=new Date;f.setHours(0,0,0,0),f=new Date(f.getFullYear(),f.getMonth()-6,1),f=f.toISOString();var g=new Date;g.setHours(0,0,0,0),g=g.toISOString();var h={"position[latitude]":-23.549671,"position[longitude]":-46.6321713,"position[distance]":1e5,max_items:40,begin_date:f,end_date:g},i=function(){b.isLoadingMap=!0,a.getItems(h,function(a){for(var d=a.reports.length-1;d>=0;d--){var f=new google.maps.LatLng(a.reports[d].position.latitude,a.reports[d].position.longitude),g=new google.maps.InfoWindow,h=b.getReportCategory(a.reports[d].category_id),i=new google.maps.Marker({position:f,map:k,animation:google.maps.Animation.DROP,icon:h.marker.url,category:h,report:a.reports[d]});b.markers.reports[h.id][a.reports[d].id]=i,i.setVisible(!0),google.maps.event.addListener(i,"click",function(){var a='<div class="pinTooltip"><h1>{{category.title}}</h1><p>Enviada {{ report.created_at | date: \'dd/MM/yy HH:mm\'}}</p><a href="" ng-click="viewReport(report, category)">Ver detalhes</a></div>',d=e.$new(!0);d.category=this.category,d.report=this.report,d.viewReport=b.viewReport;var f=c(a)(d);d.$apply(),g.setContent(f[0]),g.open(k,this)}),b.isLoadingMap=!1}console.log(b.markers.reports)})};i();var j=null;e.$watch("itemsPeriod",function(){if("undefined"!=typeof e.itemsPeriod){b.isLoadingMap=!0;for(var a=b.categories.length-1;a>=0;a--)angular.forEach(b.markers.reports[b.categories[a].id],function(a){a.setVisible(!1)});h.begin_date=e.itemsPeriod.beginDate,h.end_date=e.itemsPeriod.endDate,j&&d.cancel(j),j=d(function(){i()},700),angular.element(".sidebar_filter").addClass("active")}})}}),b.map=k}}}]),angular.module("zupWebAngularApp").directive("filterReportsCategory",function(){return{restrict:"A",link:function(a,b){b.click(function(){b.toggleClass("active")})}}}),angular.module("zupWebAngularApp").controller("ReportsCtrl",["$scope","Reports",function(a,b){a.loadingReports=!0,b.getMyItems(function(b){a.reports=b.reports,a.currentReport=b.reports[0],a.loadingReports=!1}),a.viewReport=function(b){a.currentReport=b}}]),angular.module("zupWebAngularApp").controller("AccountCtrl",["$scope","Alert","Users",function(a,b,c){a.inputs={},a.submit=function(){a.inputErrors={},a.processingForm=!0,c.update(a.me,function(){a.processingForm=!1,b.show("Parabéns!","Dados atualizados com sucesso.")},function(b){a.processingForm=!1,a.inputErrors=b.data.error})}}]),angular.module("zupWebAngularApp").directive("changeBodyStyle",function(){return{restrict:"A",link:function(a,b){a.$watch("page",function(){"reports"===a.page||"account"===a.page?b.addClass("account"):b.removeClass("account")})}}}),angular.module("zupWebAngularApp").directive("searchMap",["$rootScope",function(a){return{restrict:"A",link:function(b,c){var d=a.map,e={types:["geocode"],componentRestrictions:{country:"br"}},f=new google.maps.places.Autocomplete(c[0],e);f.bindTo("bounds",d);var g=new google.maps.Marker({map:d});google.maps.event.addListener(f,"place_changed",function(){g.setVisible(!1);var a=f.getPlace();a.geometry&&(a.geometry.viewport?d.fitBounds(a.geometry.viewport):(d.setCenter(a.geometry.location),d.setZoom(17)),g.setIcon({url:a.icon,size:new google.maps.Size(71,71),origin:new google.maps.Point(0,0),anchor:new google.maps.Point(17,34),scaledSize:new google.maps.Size(35,35)}),g.setPosition(a.geometry.location),g.setVisible(!0))});var h=d.getStreetView();google.maps.event.addListener(h,"visible_changed",function(){h.getVisible()?c.hide():c.show()})}}}]),angular.module("zupWebAngularApp").directive("searchReportMap",function(){return{restrict:"A",link:function(a,b){var c=a.reportMap,d={types:["geocode"],componentRestrictions:{country:"br"}},e=new google.maps.places.Autocomplete(b[0],d);e.bindTo("bounds",c),google.maps.event.addListener(e,"place_changed",function(){var b=e.getPlace();b.geometry&&(b.geometry.viewport?c.fitBounds(b.geometry.viewport):(c.setCenter(b.geometry.location),c.setZoom(17)),a.reportMarker.setPosition(b.geometry.location),a.reportChangedMarkerPosition())})}}}),angular.module("zupWebAngularApp").directive("sliderFilter",["$rootScope",function(a){return{restrict:"A",link:function(b,c){$(c).slider({value:1,min:1,max:4,step:1,slide:function(b,c){if(1==c.value){var d=new Date;d.setHours(0,0,0,0),d=new Date(d.getFullYear(),d.getMonth()-6,1),d=d.toISOString()}if(2==c.value){var d=new Date;d.setHours(0,0,0,0),d=new Date(d.getFullYear(),d.getMonth()-3,1),d=d.toISOString()}if(3==c.value){var d=new Date;d.setHours(0,0,0,0),d=new Date(d.getFullYear(),d.getMonth()-1,1),d=d.toISOString()}if(4==c.value){var d=new Date;d.setDate(d.getDate()-7),d=d.toISOString()}var e=new Date;e.setHours(0,0,0,0),e=e.toISOString(),a.itemsPeriod={beginDate:d,endDate:e},a.$apply()}})}}}]);