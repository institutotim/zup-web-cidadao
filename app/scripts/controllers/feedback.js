'use strict';

angular.module('zupWebAngularApp')

.controller('FeedbackCtrl', ['$scope', '$q', 'Feedback', 'Reports', 'Alert', 'Users', '$routeParams', '$location', '$fileUploader', function ($scope, $q, Feedback, Reports, Alert, Users, $routeParams, $location, $fileUploader) {

  var feedbackId = $routeParams.feedbackId;

  if (typeof feedbackId !== 'undefined') {
    Users.getMe(function (me) {
      Reports.getItems({id: feedbackId}, function (feedback) {
        var inTime;

        var myId = me.user.id;

        var ownerId = feedback.report.user.id;

        // se isNull for igual a null ^^ o feedback poderá ser enviado.
        var isNull = feedback.report.feedback;

        var timeNow = Math.round(+new Date() / 1000);

        var rTime = feedback.report.category.user_response_time;

        for (var i = 0; i < feedback.report.status_history.length; i++) {
          if (feedback.report.status_history[i].new_status.id == 7 ) {
           inTime = feedback.report.status_history[i].updated_at;
          }
        }

        inTime = Math.round(new Date(inTime).getTime()/1000);
        inTime = timeNow - inTime;

        if (myId == ownerId && isNull == null && inTime < rTime) {
          $scope.feedbackItem = feedback.report;
          $scope.marker = $scope.feedbackItem.category.marker.default.web.replace(/^https:\/\//i, 'http://');
          $scope.statusType = $scope.feedbackItem.status_history;
        } else {
          Alert.show('Feedback', 'Parece que você está acessando um feedback inválido, ou com tempo de resposta expirado.', function () {
            $location.path('/');
          });
        }
      });
    });

    var kind = '';
    $scope.kindTrue = false;
    $scope.setKind = function (e) {
      kind = $(e).selector;

      if(kind == 'positive') {
        $('#positive').addClass('active');
        $('#negative').removeClass('active');
      } else {
        $('#negative').addClass('active');
        $('#positive').removeClass('active');
      }

      $scope.kindTrue = true;
      return kind;
    };

    var uploader = $scope.uploader = $fileUploader.create({
      scope: $scope
    });

    // Images only
    uploader.filters.push(function(item /*{File|HTMLInputElement}*/) {
      var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
      type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
      return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    });

    $scope.feedbackInputs = {
      id: feedbackId,
      description: null
    };

    $scope.sendFeedback = function() {
      $scope.feedbackInputs.kind = kind;
      $scope.inputErrors = {};
      $scope.processingForm = true;
      var images = [], promises = [];

      // Add images to queue for processing it's dataUrl
      function addAsync(file) {
        var deferred = $q.defer();

        var file = file, picReader = new FileReader();

        picReader.addEventListener('load', function(event) {
          var picFile = event.target;
          images.push(picFile.result.replace(/^data:image\/[^;]+;base64,/, ''));
          deferred.resolve();
        });

        // pass as base64 and strip data:image
        picReader.readAsDataURL(file);

        return deferred.promise;
      };

      for (var i = uploader.queue.length - 1; i >= 0; i--) {
        promises.push(addAsync(uploader.queue[i].file));
      };

      // Wait for all promises to be resolved to send request
      $q.all(promises).then(function() {
        var newFeedback = new Feedback({
          id: $scope.feedbackInputs.id,
          kind: $scope.feedbackInputs.kind,
          content: $scope.feedbackInputs.description,
          images: images
        });

        newFeedback.$saveFeedback(function(data) {
          Alert.show('Feedback', 'Feedback enviado como sucesso.', function() {
            $location.path('/');
          });
          $scope.processingForm = false;
        });
      });
    };
  }
}]);
