'use strict';

/**
 * @ngdoc function
 * @name app.controller:MainController
 * @description
 * # MainCtrl
 * Controller of the app
 */
angular.module('newTab')
  .controller('MainController', function ($scope, $log, BrowserHistory) {

    var getData = function() {
      BrowserHistory.getHistoryWithVisits().then(function(d) {
        $scope.allSites = d;
      });
    };

    var _init = function() {
      getData();
    };

    _init();

  });