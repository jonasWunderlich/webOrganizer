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
     * @methodOf newTab.MainController
     * @description Run Functions at Startup
     */
    var _init = function() {
      getData();
    };

    _init();


    $scope.getContextColor = function(site) {
      if(site.context) {
        if(site.context.indexOf('neutral') !== 0) {
          return 'background:'+$scope.storedContexts[site.context]['color'];
        }
      }
    };

    $scope.getContextColorIfBookmark = function(site) {
      if(site.context && site.bookmark) {
        if(site.context.indexOf('neutral') !== 0) {
          return 'background:'+$scope.storedContexts[site.context]['color'];
        }
      }
    };

    $scope.isTab = function(site) {
      return site.tab;
    };

    $scope.getPanelClasses = function(site) {
      var _visited, _bookmark, _tab, _context;

      _bookmark = (site.bookmark) ? 'bookmark' : '';
      _tab = (site.tab) ? 'tab' : '';

      _context = '';

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
      return _visited + ' ' + _bookmark + ' ' + _tab + ' ' + _context;
    };

    $scope.setBookmark = function(site) {
      if(site.bookmark) {
        chrome.bookmarks.remove(site.bookmark, function(result) {
          $log.debug("Bookmark removed:", result);
          site.bookmark = false;
        });
      } else {
        chrome.bookmarks.create({'parentId': site.context,
          'title': site.title,
          'url': site.url
        }, function(result) {
          $log.debug("Bookmark added:", result);
          site.bookmark = result.id;
        });
      }
    };

    $scope.activateTab = function(tab) {
      $log.debug('trying to activate tab', tab);
      //chrome.browserAction.enable(tab.id);
      chrome.tabs.update(tab.id, {selected: true});
    };

    $scope.createTabs = function(contextId) {
      $scope.storageData.deaktivatedTabs[contextId].forEach(function(tab) {
        chrome.tabs.create(tab, function(callback) {

          //options = {
          //  windowId: 0,
          //  index: 0,
          //  url: 0,
          //  active: 0,
          //  selected: 0,
          //  pinned: 0,
          //  openerTabId: 0
          //};

        });
      });
    };

  });