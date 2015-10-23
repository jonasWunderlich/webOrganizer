'use strict';

/**
 * @ngdoc function
 * @name app.controller:NewTabPageController
 * @description
 * Controller of the app
 */

angular.module('newTab').controller('NewTabPageController', function ($scope, $log, BrowserHistory, Storage) {

  var deactivatedTabs = [];

  /**
   * @ngdoc method
   * @name getData
   * @methodOf newTab.NewTabPageController
   * @description Write all the Data in the scope
   */
  var getData = function getData() {
    BrowserHistory.getProcessedHistory().then(function (d) {
      $scope.allSites = d.reverse();
    });
    BrowserHistory.getBookmarks().then(function (d) {
      $scope.bookmarks = d;
    });
    BrowserHistory.getOpenTabs().then(function (d) {
      $scope.openedTabs = d;
    });
    Storage.getStorageBytesInUse().then(function (d) {
      $scope.storageBytesInUse = d;
    });
    Storage.getStorage().then(function (d) {
      $scope.storageData = d;
    });
  };

  /**
   * @ngdoc method
   * @name activateContext
   * @methodOf newTab.NewTabPageController
   * @description Activates a specific context: retrieves all closed Tabs & shows Content of hidden Context
   * @param context
   */
  $scope.activateContext = function (context) {
    deactivatedTabs[context].forEach(function (tab) {
      $log.debug('Rebuild the Tabs of Context');
      chrome.tabs.create(tab, function (callback) {
        delete deactivatedTabs[context];
        $log.debug('Tab created', callback);
      });
    });
    //TODO:
  };

  /**
   * @ngdoc method
   * @name deactivateContext
   * @methodOf newTab.NewTabPageController
   * @description DeActivates a specific context: Closes all Tabs in this Context & hides all Content of this Context
   * @param context
   */
  $scope.deactivateContext = function (context) {
    $log.debug('Deactivate Context / close all Tabs');
    var removeTabs = [];
    var indexesOfTabsToRemove = [];
    $scope.allSites.forEach(function (site) {
      if (site.tab && site.context === context) {
        var tabToRemove = {
          windowId: site.tab.windowId,
          index: site.tab.id,
          url: site.url,
          active: site.tab.active,
          pinned: site.tab.pinned,
          openerTabId: site.tab.openerTabId
        };
        removeTabs.push(tabToRemove);
        indexesOfTabsToRemove.push(site.tab.id);
      }
    });
    chrome.tabs.remove(indexesOfTabsToRemove, function (callback) {
      deactivatedTabs[context] = removeTabs;
      $log.debug('Tabs removed', callback);
    });
  };

  /**
   * @ngdoc method
   * @name _init
   * @methodOf newTab.NewTabPageController
   * @description Run Functions at Startup
   */
  var _init = function _init() {
    getData();
  };

  _init();
});
//# sourceMappingURL=newTabPage.js.map
