'use strict';

/**
 * @ngdoc service
 * @name newTab.ChromeApi
 * @description get
 * Service for communication with the Browser-API
 */

angular.module('newTab')
  .service('ChromeApi', function ($log, $http, $q, configuration) {

    var data = {};

    /**
     * @ngdoc method
     * @name getBookmarks
     * @methodOf newTab.ChromeApi
     * @description get all Browser-Bookmarks in its Tree-Structure
     * @returns {promise}
     */
    var getBookmarks = function() {

      var deferred = $q.defer();

      if(data.bookmarkTree) {
        $log.debug('BookmarkTree received without API-Call');
        deferred.resolve(data.bookmarkTree);
      } else {
        chrome.bookmarks.getTree(function(response) {
          if (response) {
            $log.debug('BookmarkTree retrieved by API-Call:', response);
            //deferred.resolve(response[0].children[0].children);
            data.bookmarkTree = response;
            deferred.resolve(response);
          } else {
            $log.debug('Unable to retrieve Bookmark-Tree data', response);
            deferred.reject('unable to retrieve Bookmark-Tree data');
          }
        });
      }

      return deferred.promise;
    };

    /**
     * @ngdoc method
     * @name getOpenTabs
     * @methodOf newTab.ChromeApi
     * @description get active Tabs ether of a specific Window all by setting no ID all Tabs
     * @param windowId
     * @returns {promise}
     */
    var getOpenTabs = function(windowId) {

      var deferred = $q.defer();

      if(data.openTabs) {
        $log.debug('Tabs received without API-Call');
        deferred.resolve(data.openTabs);
      } else {
        var config = {};
        chrome.tabs.query(config, function(response) {
          if(response) {
            var _activeWindow = 'all';
            if(windowId !== undefined) {
              _activeWindow = windowId;
            }
            $log.debug('Tabs in '+_activeWindow+' retrieved by API-Call:', response);
            data.openTabs = response;
            deferred.resolve(response);
          } else {
            $log.debug('Unable to retrieve opened Tabs', response);
            deferred.reject('Unable to retrieve opened Tabs');
          }
        });
      }
      return deferred.promise;
    };

    /**
     * @ngdoc method
     * @name getHistory
     * @methodOf newTab.ChromeApi
     * @description get History with the set Configuration
     * @returns {promise}
     */
    var getHistory = function() {

      var deferred = $q.defer();

      if(data.history) {
        $log.debug('History received without API-Call');
        deferred.resolve(data.history);
      } else {
        var config = configuration.getHistoryConfiguration();
        chrome.history.search(config, function(response) {
          if(response) {
            $log.debug('History received with API-Call');
            data.history = response;
            deferred.resolve(response)
          } else {
            $log.debug('Unable to retrive getHistory', response);
            deferred.reject('Unable to retrieve History');
          }
        });
      }

      return deferred.promise;
    };

    /**
     * @ngdoc method
     * @name getVisits
     * @methodOf newTab.ChromeApi
     * @description get Visits for a specific Page - The Depth of retrievable Visits can be configured
     * @param page
     * @returns {promise}
     */
    var getVisits = function(page) {

      var deferred = $q.defer();

      if(data.visits.page) {
        $log.debug('siteVisits received without API-Call',data.visits.page);
        deferred.resolve(data.visits.page);
      } else {
        var config = {'url': page.url };
        chrome.history.getVisits(config, function(response) {
          if(response) {
            data.visits.page = response;
            deferred.resolve(response);
          } else {
            $log.debug('Unable to retrieve getVisits', response);
            deferred.reject('Unable to retrieve getVisits');
          }
        });
      }

      return deferred.promise;
    };

    /**
     * @ngdoc method
     * @name getStorage
     * @methodOf newTab.ChromeApi
     * @description get Data of Storage - If no variable is set get complete Storage is return - else it is tried to get the specific storage-data
     * @param variable
     * @returns {promise}
     */
    var getStorage = function(variable) {

      var deferred = $q.defer();

      if(data[variable]) {
        $log.debug('Quota retrieved without API-Call',data[variable]);
        deferred.resolve(data[variable]);
      } else {
        chrome.storage.local.get(variable, function(response) {
          if (response) {
            if(variable !== undefined) {
              if (response[variable] !== undefined) {
                var _storageData = response[variable];
                $log.debug('Storage data for '+variable+' retrieved by API-Call');
                data[variable] = _storageData;
                deferred.resolve(_storageData);
              } else {
                $log.debug('Storage variable '+variable+' is not set');
                deferred.reject('unable to retrieve Storage data');
              }
            }
            else {
              $log.debug('Complete Storage Data retrieved');
              deferred.resolve(response);
            }
          } else {
            $log.debug('Unable to retrieve Storage data', response);
            deferred.reject('unable to retrieve Storage data');
          }
        });
      }

      return deferred.promise;
    };

    /**
     * @ngdoc method
     * @name getStorageBytesInUse
     * @methodOf newTab.ChromeApi
     * @description get Bytes so far used in the storage (5MB locally available)
     * @returns {promise}
     */
    var getStorageQuota = function() {

      var deferred = $q.defer();

      if(data.quota) {
        $log.debug('Quota retrieved without API-Call',data.quota);
        deferred.resolve(data.quota);
      } else {
        chrome.storage.local.getBytesInUse(function(response) {
          if (response) {
            $log.debug('Quota retrieved by API-Call:', response);
            data.quota = response;
            deferred.resolve(response);
          } else {
            $log.debug('Unable to get Storage Usage', response);
            deferred.reject('Unable to get Storage Usage');
          }
        });
      }

      return deferred.promise;
    };

    return {
      getBookmarks: getBookmarks,
      getOpenTabs: getOpenTabs,
      getHistory: getHistory,
      getVisits: getVisits,
      getStorageQuota: getStorageQuota,
      getStorage: getStorage
    };

  });
