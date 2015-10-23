'use strict';

/**
 * @ngdoc service
 * @name newTab.ChromeApi
 * @description get
 * Service for communication with the Browser-API
 */

angular.module('newTab').service('ChromeApi', function ($log, $http, $q, configuration) {

  /**
   * @ngdoc method
   * @name getBookmarks
   * @methodOf newTab.ChromeApi
   * @description get all Browser-Bookmarks in its Tree-Structure
   * @returns {promise}
   */
  var getBookmarks = function getBookmarks() {
    var deferred = $q.defer();
    chrome.bookmarks.getTree(function (response) {
      if (response) {
        $log.debug('Bookmark-Tree data retrieved:', response[0].children[0].children);
        deferred.resolve(response[0].children[0].children);
      } else {
        $log.debug('Unable to retrieve Bookmark-Tree data', response);
        deferred.reject('unable to retrieve Bookmark-Tree data');
      }
    });
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
  var getOpenTabs = function getOpenTabs(windowId) {
    var deferred = $q.defer();
    var _config = {};
    chrome.tabs.query(_config, function (response) {
      if (response) {
        var _activeWindow = 'all';
        if (windowId !== undefined) {
          _activeWindow = windowId;
        }
        $log.debug('opened Tabs in ' + _activeWindow + ' retrieved:', response);
        deferred.resolve(response);
      } else {
        $log.debug('Unable to retrieve opened Tabs', response);
        deferred.reject('Unable to retrieve opened Tabs');
      }
    });
    return deferred.promise;
  };

  /**
   * @ngdoc method
   * @name getHistory
   * @methodOf newTab.ChromeApi
   * @description get History with the set Configuration
   * @returns {promise}
   */
  var getHistory = function getHistory() {
    var deferred = $q.defer();
    var config = configuration.getHistoryConfiguration();
    chrome.history.search(config, function (response) {
      if (response) {
        $log.debug('getHistory data retrieved:');
        deferred.resolve(response);
      } else {
        $log.debug('Unable to retrive getHistory', response);
        deferred.reject('Unable to retrieve History');
      }
    });
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
  var getVisits = function getVisits(page) {
    var deferred = $q.defer();
    var _config = { 'url': page.url };
    chrome.history.getVisits(_config, function (response) {
      if (response) {
        // $log.debug('getVisits data retrieved:', response);
        deferred.resolve(response);
      } else {
        $log.debug('Unable to retrieve getVisits', response);
        deferred.reject('Unable to retrieve getVisits');
      }
    });
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
  var getStorage = function getStorage(variable) {
    var deferred = $q.defer();
    chrome.storage.local.get(variable, function (response) {
      if (response) {
        if (variable !== undefined) {
          if (response[variable] !== undefined) {
            var _storageData = response[variable];
            $log.debug('Storage data for ' + variable + ' retrieved:');
            deferred.resolve(_storageData);
          } else {
            $log.debug('Storage variable ' + variable + ' is not set');
            deferred.reject('unable to retrieve Storage data');
          }
        } else {
          $log.debug('Complete Storage Data retrieved');
          deferred.resolve(response);
        }
      } else {
        $log.debug('Unable to retrieve Storage data', response);
        deferred.reject('unable to retrieve Storage data');
      }
    });
    return deferred.promise;
  };

  /**
   * @ngdoc method
   * @name getStoredConfiguration
   * @methodOf newTab.ChromeApi
   * @description get Explicitly the Configuration-Data from the Local Storage
   * @returns {promise}
   */
  //var getStoredConfiguration = function() {
  //  var deferred = $q.defer();
  //  getStorage('configuration')
  //    .then(function(response) {
  //      if(response) {
  //        $log.debug('stored Configuration found', response);
  //        return response;
  //      } else {
  //        $log.debug('no stored Configuration found trying to build');
  //        var configObject = {
  //          'version': 0.01
  //        };
  //        //TODO: Put this in an extra Function that returns a promise
  //        chrome.storage.local.set({'configuration':configObject}, function(response) {});
  //      }
  //    });
  //  return deferred.promise;
  //};

  /**
   * @ngdoc method
   * @name getStorageBytesInUse
   * @methodOf newTab.ChromeApi
   * @description get Bytes so far used in the storage (5MB locally available)
   * @returns {promise}
   */
  var getStorageBytesInUse = function getStorageBytesInUse() {
    var deferred = $q.defer();
    chrome.storage.local.getBytesInUse(function (response) {
      if (response) {
        $log.debug('Storage Bytes retrieved:', response);
        deferred.resolve(response);
      } else {
        $log.debug('Unable to get Storage Usage', response);
        deferred.reject('Unable to get Storage Usage');
      }
    });
    return deferred.promise;
  };

  return {
    getBookmarks: getBookmarks,
    getOpenTabs: getOpenTabs,
    getHistory: getHistory,
    getVisits: getVisits,
    getStorageBytesInUse: getStorageBytesInUse,
    getStorage: getStorage
    //getStoredConfiguration: getStoredConfiguration
  };
});
//# sourceMappingURL=chromeApi.js.map
