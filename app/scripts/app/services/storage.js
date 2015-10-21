'use strict';

/**
 * @ngdoc service
 * @name newTab.Storage
 * @description
 * # Storage
 * Service for getting the Browser Storage
 */
angular.module('newTab')
  .service('Storage', function ($log, $http, $q, configuration, ChromeApi) {



    var getStoredConfiguration = function() {
      var deferred = $q.defer();
      ChromeApi.getStorage('configuration')
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



    var getStoredContexts = function() {
      var deferred = $q.defer();
      ChromeApi.getBookmarks()
        .then(function(bookmarks) {
          ChromeApi.getStorage('contextOptions').then(function(contextOptions) {
              $log.debug('Context Options found', contextOptions);
              writeContextOptions(bookmarks);
              deferred.resolve(contextOptions);
            }, function(error) {
              $log.debug('Building New Context Options');
              writeContextOptions(bookmarks);
            }
          );
      });
      return deferred.promise;
    };


    var writeContextOptions = function(bookmarks) {

      var _contextOptions = setupContextOptions(bookmarks);
      chrome.storage.local.set({'contextOptions': _contextOptions},
        function(response) {
          return null;
      });
    };



    var setupContextOptions = function(data) {

      var bookmarkFolder = _.filter(data, 'children');
      var result = {};

      _.each(bookmarkFolder, function(item) {
        var entry = _.omit(item, 'id', 'dateGroupModified', 'dateAdded', 'children')
        entry.color = '#FFF';
        result[item.id] = entry;
        // TODO: Maybe its better to filter empty objects before the recursion
        _.merge(result, setupContextOptions(item.children))
      });
      return result;
    };




    return {
      getStorageBytesInUse: ChromeApi.getStorageBytesInUse,
      getStorage: ChromeApi.getStorage,
      getStoredConfiguration: getStoredConfiguration,
      getStoredContexts: getStoredContexts
    };

  });
