'use strict';

/**
 * @ngdoc function
 * @name app.controller:NewTabPageController
 * @description
 * Controller of the app
 */

angular.module('newTab')
  .controller('NewTabPageController', function ($scope, $log, $q, $window, BrowserHistory, StorageService, sitesManager) {

    var deactivatedTabs = [];

    /**
     * @ngdoc method
     * @name getData
     * @methodOf newTab.NewTabPageController
     * @description Write all the Data in the scope
     */
    var _getData = function() {

      //BrowserHistory.getProcessedHistory().then(function(d) {
      //  $scope.allSites = d.reverse();
      //});
      //BrowserHistory.getBookmarks().then(function(d) {
      //});
      //BrowserHistory.getOpenTabs().then(function(d) {
      //  $scope.openedTabs = d;
      //});
      //StorageService.getStorageBytesInUse().then(function(d) {
      //  $scope.storageBytesInUse = d;
      //});
      //StorageService.getStorage().then(function(d) {
      //  $scope.storageData = d;
      //});
      //StorageService.buildStoredContextUrls().then(function(d) {
      //  $scope.storageContextUrls = d;
      //});

      $q.all([
        sitesManager.loadAllSitesEnhanced(),
        StorageService.getStoredContexts()
      ]).then(function(data) {
          $scope.newSites = data[0].reverse();
          $scope.contextOptions = data[1]
      });
    };

    var _reload = function() {
      $window.location.reload();
    };

    /**
     * @ngdoc method
     * @name _init
     * @methodOf newTab.NewTabPageController
     * @description Run Functions at Startup
     */
    var _init = function() {
      _getData();
    };

    _init();




    /**
     * @ngdoc method
     * @name getContextColor
     * @methodOf newTab.NewTabPageController
     * @description Returns Background-Style for Context-Color
     * @returns {string} Background-Style for Context
     */
    $scope.getContextColor = function(context) {
      if(context !== 'undefined' ) {
        if(context.indexOf('neutral') < 0 && context.indexOf(',') < 0) {
          var color = StorageService.getContextColor(context);
          return 'background:'+color;
        }
      }
    };

    /**
     * @ngdoc method
     * @name getContextTitle
     * @methodOf newTab.NewTabPageController
     * @description Returns Title of Context
     * @returns {string} Title of Context
     */
    $scope.getContextTitle = function(context) {
      if(context !== 'undefined' ) {
        if(context.indexOf('neutral') < 0 && context.indexOf(',') < 0) {
          return StorageService.getContextTitle(context);
        }
      }
    };

    /**
     * @ngdoc method
     * @name contextIsActive
     * @methodOf newTab.NewTabPageController
     * @description Returns Title of Context
     * @returns {string} Title of Context
     */
    $scope.contextIsActive = function(context) {
      if(context !== 'undefined' ) {
        if(context.indexOf('neutral') < 0 && context.indexOf(',') < 0) {
          return $scope.contextOptions[context].active;
        }
      }
    };

    /**
     * @ngdoc method
     * @name toggleContext
     * @methodOf newTab.pagePanel
     * @description Toggles the activity of a context
     * @param {object} context
     */
    $scope.toggleContext = function(context) {
      $log.debug('Toggle Context', context);
      $log.debug('Deactivated Tabs', deactivatedTabs);
      $log.debug('Active Context', context.active);

      if(typeof context.active === 'undefined' ) {
        context.active = false;
      } else {
        context.active = !context.active;
      }


      if(deactivatedTabs[context]) {
        $scope.activateContext(context);
      } else {
        $scope.deactivateContext(context);
      }
    };


    /**
     * @ngdoc method
     * @name activateContext
     * @methodOf newTab.NewTabPageController
     * @description Activates a specific context: retrieves all closed Tabs & shows Content of hidden Context
     * @param {String} context
     */
    $scope.activateContext = function(context) {
      deactivatedTabs[context].forEach(function(tab) {
      $log.debug('Rebuild the Tabs of this Context');
        chrome.tabs.create(tab, function(callback) {
          delete deactivatedTabs[context];
          $log.debug('Tab created', callback);
        });
      });
    };

    /**
     * @ngdoc method
     * @name deactivateContext
     * @methodOf newTab.NewTabPageController
     * @description DeActivates a specific context: Closes all Tabs in this Context & hides all Content of this Context
     * @param {String} context
     */
    $scope.deactivateContext = function(context) {
      $log.debug('Deactivate Context / close all Tabs');
      var removeTabs = [];
      var indexesOfTabsToRemove = [];
      context.sites.forEach(function(site) {
        if(site.tab) {
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
      chrome.tabs.remove(indexesOfTabsToRemove, function(callback){
        deactivatedTabs[context] = removeTabs;
        $log.debug('Tabs removed',callback);
      });
    };





  });