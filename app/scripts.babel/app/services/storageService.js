'use strict';

/**
 * @ngdoc service
 * @name newTab.StorageService
 * @description
 * Service for getting the Browser Storage
 */

angular.module('newTab')
  .service('StorageService', function ($log, $http, $q, ChromeApi) {

    /**
     * @ngdoc method
     * @name getStoredContexts
     * @methodOf newTab.StorageService
     * @description Checks if Context-Configuration already exists in the Storage - If not creates it
     * @returns {promise}
     */
    var getStoredContexts = function() {
      var deferred = $q.defer();
      ChromeApi.getBookmarks()
        .then(function(bookmarks) {
          ChromeApi.getStorage('contextOptions').then(function(contextOptions) {
              $log.debug('Context Options found');
              //TODO: For now Options are rewritten with every reload for Setting up the correct settings
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


    /**
     * @ngdoc method
     * @name writeContextOptions
     * @methodOf newTab.StorageService
     * @description
     * @param bookmarks
     */
    var writeContextOptions = function(bookmarks) {
      //TODO: Maybe this can be put into the getStoredContext-method later
      var _contextOptions = setupContextOptions(bookmarks);
      //TODO: This needs to be put as a function to the ChromeApi that returns a promise
      chrome.storage.local.set({'contextOptions': _contextOptions}, function(result) {
        $log.debug('contextOptions written to Storage', result)
      });
    };

    /**
     * @ngdoc method
     * @name setupContextOptions
     * @methodOf newTab.StorageService
     * @description Recursive Function for writing Context Configuration Data in the Storage
     * @param data
     * @returns {{}}
     */
    var setupContextOptions = function(data) {
      var bookmarkFolder = _.filter(data, 'children');
      var result = {};
      _.each(bookmarkFolder, function(item) {
        var childrenOfFolder = _.filter(item.children,function(result){
          return typeof result.children === 'undefined';
        });
        var entry = _.omit(item, 'id', 'dateGroupModified', 'dateAdded', 'children');
        entry.color = randomColor();
        entry.children = childrenOfFolder;
        result[item.id] = entry;
        // TODO: Maybe its better to filter empty objects before the recursion
        _.merge(result, setupContextOptions(item.children))
      });
      return result;
    };


    /**
     * @ngdoc method
     * @name buildStoredContextUrls
     * @methodOf newTab.StorageService
     * @description Builds Array that references the Urls of the Bookmarks to its context
     * @returns {promise}
     */
    var buildStoredContextUrls = function() {
      var deferred = $q.defer();
      var _storedContextUrls = {};
      var _lastContextIndex = '';

      getStoredContexts().then(function(storedContext) {

        _.each(storedContext, function(result) {

          _.each(result.children, function(result2) {

            var _subStr = result2.url.substr(0,17);
            if(typeof _storedContextUrls[_subStr] === 'undefined') {
              _storedContextUrls[_subStr] = result2.parentId;
            } else if(_lastContextIndex !== result2.parentId) {
              _storedContextUrls[_subStr] = _storedContextUrls[_subStr]+','+result2.parentId;
            }
            _lastContextIndex = result2.parentId;
          });
        });

        chrome.storage.local.set({'_storedContextUrls': _storedContextUrls}, function() {
          $log.debug('stored _storedContextUrls');
          deferred.resolve(_storedContextUrls);
        });

        //$log.debug('Try filtering Children of Bookmarks in Context',_filter);
        //var _filter = _.each(_contextOptions, function(result){
        //  _.filter(result.children, function(result2){
        //    return result2.url.substr(0,20) === 'http://www.vr-bank-m';
        //  });
        //});
      });
      return deferred.promise;
    };


    return {
      getStorageBytesInUse: ChromeApi.getStorageBytesInUse,
      getStorage: ChromeApi.getStorage,
      getStoredConfiguration: ChromeApi.getStoredConfiguration,
      getStoredContexts: getStoredContexts,
      buildStoredContextUrls: buildStoredContextUrls
    };

  });
