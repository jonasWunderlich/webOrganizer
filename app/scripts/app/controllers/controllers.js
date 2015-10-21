'use strict';

/**
 * @ngdoc function
 * @name app.controller:MainController
 * @description
 * # MainCtrl
 * Controller of the app
 */
angular.module('newTab')
  .controller('MainController', function ($scope, $log, BrowserHistory, Storage) {

    var getData = function() {
      BrowserHistory.getHistoryWithVisits().then(function(d) {
        $scope.allSites = d;
      });
     BrowserHistory.getBookmarks().then(function(d) {
        $scope.bookmarks = d;
      });
      BrowserHistory.getOpenTabs().then(function(d) {
        $scope.openedTabs = d;
      });
      Storage.getStorageBytesInUse().then(function(d) {
        $scope.storageBytesInUse = d;
      });
      Storage.getStorage().then(function(d) {
        $scope.storageData = d;
      });
      // Storage.getStoredConfiguration().then(function(d) {
      //   $scope.storedConfiguration;
      // });
      Storage.getStoredContexts().then(function(d) {
        $scope.storedContexts;
      });
    };

    var _init = function() {
      getData();
    };

    _init();

  });