'use strict';

/**
 * @ngdoc service
 * @name newTab.Storage
 * @description
 * # Storage
 * Service for getting the Browser Storage
 */
angular.module('newTab')
  .service('ChromeApi', function ($log, $http, $q, configuration) {

    /**
     * [getBookmarks description]
     * @return {[type]} [description]
     */
    var getBookmarks = function() {
      var deferred = $q.defer();
      chrome.bookmarks.getTree(function(response) {
        if (response) {
          $log.debug('Bookmark-Tree data retrieved:', response[0].children[0].children);
          deferred.resolve(response[0].children[0].children)
        } else {
          $log.debug('Unable to retrieve Bookmark-Tree data', response);
          deferred.reject('unable to retrieve Bookmark-Tree data')
        }
      });
      return deferred.promise;
    };

    var getOpenTabs = function(windowId) {
      var deferred = $q.defer();
      var _config = {};
      chrome.tabs.query(_config, function(response) {
        if(response) {
          var _activeWindow = 'all';
          if(windowId !== undefined) {
            _activeWindow = windowId;
          }
          $log.debug('opened Tabs in '+_activeWindow+' retrieved:', response);
          deferred.resolve(response);
        } else {
          $log.debug('Unable to retrieve opened Tabs', response);
          deferred.reject('Unable to retrieve opened Tabs');
        }
      });
      return deferred.promise;
    };

    var getHistory = function() {
      var deferred = $q.defer();
      var config = configuration.getHistoryConfiguration();
      chrome.history.search(config, function(response) {
        if(response) {
          $log.debug('getHistory data retrieved:', response);
          deferred.resolve(response)
        } else {
          $log.debug('Unable to retrive getHistory', response);
          deferred.reject('Unable to retrieve History');
        }
      });
      return deferred.promise;
    };

    var getVisits = function(page) {
      var deferred = $q.defer();
      var _config = {'url': page.url };
      chrome.history.getVisits(_config, function(response) {
        if(response) {
          // $log.debug('getVisits data retrieved:', response);
          deferred.resolve(response);
        } else {
          $log.debug('Unable to retrieve getVisits', response);
          deferred.reject('Unable to retrieve getVisits');
        }
      });
      return deferred.promise;
    };

    var getStorage = function(variable) {
      var deferred = $q.defer();
      chrome.storage.local.get(variable, function(response) {
        if (response) {
          if(variable !== undefined) {
            if (response[variable] !== undefined) {
              var _storageData = response[variable];
              $log.debug('Storage data for '+variable+' retrieved:', _storageData);
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
      return deferred.promise;
    };

    var getStorageBytesInUse = function() {
      var deferred = $q.defer();
      chrome.storage.local.getBytesInUse(function(response) {
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

    var getStoredConfiguration = function() {
      var deferred = $q.defer();
      getStorage('configuration')
        .then(function(response) {
          if(response) {
            $log.debug('stored Configuration found', response);
            return response;
          } else {
            $log.debug('no stored Configuration found trying to build');
            var configObject = {
              'version': 0.01
            }
            chrome.storage.local.set({'configuration':configObject}, function(response) {

            });
          }
        });
      return deferred.promise;
    }

    return {
      getBookmarks: getBookmarks,
      getOpenTabs: getOpenTabs,
      getHistory: getHistory,
      getVisits: getVisits,
      getStorageBytesInUse: getStorageBytesInUse,
      getStorage: getStorage,
      getStoredConfiguration: getStoredConfiguration
    };

  });
