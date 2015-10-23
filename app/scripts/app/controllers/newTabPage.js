'use strict';

/**
 * @ngdoc function
 * @name app.controller:NewTabPageController
 * @description
 * Controller of the app
 */

angular.module('newTab')
  .controller('NewTabPageController', function ($scope, $log, BrowserHistory, Storage) {

    /**
     * @ngdoc method
     * @name getData
     * @methodOf newTab.NewTabPageController
     * @description Write all the Data in the scope
     */
    var getData = function() {
      BrowserHistory.getProcessedHistory().then(function(d) {
        $scope.allSites = d.reverse();
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
      //TODO: This is unused so far
      // Storage.getStoredConfiguration().then(function(d) {
      //   $scope.storedConfiguration;
      // });
      Storage.getStoredContexts().then(function(d) {
        $scope.storedContexts = d;
      });
    };

    /**
     * @ngdoc method
     * @name _init
     * @methodOf newTab.NewTabPageController
     * @description Run Functions at Startup
     */
    var _init = function() {
      getData();
    };

    _init();

  });