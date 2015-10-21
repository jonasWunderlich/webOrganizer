'use strict';

/**
 * @ngdoc function
 * @name app.controller:MainController
 * @description
 * Controller of the app
 */

angular.module('newTab')
  .controller('MainController', function ($scope, $log, BrowserHistory, Storage) {

    /**
     * @ngdoc method
     * @name getData
     * @methodOf newTab.MainController
     * @description Write all the Data in the scope
     */
    var getData = function() {
      BrowserHistory.getProcessedHistory().then(function(d) {
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
      //TODO: This is unused so far
      // Storage.getStoredConfiguration().then(function(d) {
      //   $scope.storedConfiguration;
      // });
      Storage.getStoredContexts().then(function(d) {
        $scope.storedContexts = d;
      });
    };

    $scope.getPanelClasses = function(site) {
      var _visited, _bookmark, _tab;

      _bookmark = (site.bookmark) ? 'bookmark' : '';
      _tab = (site.tabOpen) ? 'tab' : '';

      switch (site.visitCount > 1) {
        case (site.visitCount < 5):
          _visited = 'visits-1';
          break;
        case (site.visitCount >= 5 && site.visitCount < 10):
          _visited = 'visits-2';
          break;
        case (site.visitCount >= 10):
          _visited = 'visits-3';
          break;
      }
      return _visited + ' ' + _bookmark + ' ' + _tab;
    };

    $scope.getContextColor = function(site) {
      if(site.context)
        return 'background:'+$scope.storedContexts[site.context]['color']+'';
    };

    /**
     * @ngdoc method
     * @name _init
     * @methodOf newTab.MainController
     * @description Run Functions at Startup
     */
    var _init = function() {
      getData();
    };

    _init();

  });