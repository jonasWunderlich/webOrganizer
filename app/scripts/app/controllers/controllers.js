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
     BrowserHistory.getBookmarks().then(function(d) {
        $scope.bookmarks = d;
      });
      BrowserHistory.getStorageBytesInUse().then(function(d) {
        $scope.storageBytesInUse = d;
      });
      BrowserHistory.getStorage().then(function(d) {
        $scope.storageData = d;
      });
      BrowserHistory.getOpenTabs().then(function(d) {
        $scope.openedTabs = d;
      });
    };

    var _init = function() {
      getData();
    };

    _init();

  });