'use strict';

/**
 * @ngdoc service
 * @name newTab.StorageService
 * @description
 * Service for getting the Browser Storage
 */

angular.module('newTab')
  .service('StorageService', function ($log, $http, $q, ChromeApi) {

    var storageData = {};

    /**
     * @ngdoc method
     * @name getStoredContexts
     * @methodOf newTab.StorageService
     * @description Checks if Context-Configuration already exists in the Storage - If not creates it
     * @returns {promise}
     */
    var getStoredContexts = function() {

      var deferred = $q.defer();

      if(storageData.storedContexts) {
        $log.debug('Context-Options retrieved without API-Call');
        deferred.resolve(storageData.storedContexts);
      } else {
        ChromeApi.getBookmarks().then(function(bookmarks) {

          ChromeApi.getStorage('contextOptions').then(function(response) {
            //TODO: For now Options are rewritten with every reload for Setting up the correct settings
            storageData.storedContexts = response;
            $log.debug('Using the Context-Options found in Storage',response);
            writeContextOptions(bookmarks);
            deferred.resolve(response);
          }, function(error) {
            $log.debug('Building New Context Options', error);
            writeContextOptions(bookmarks);
          });
        });
      }

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
      var _contextOptions = createContextOptionForBookmarkFolder(bookmarks);
      //TODO: This needs to be put as a function to the ChromeApi that returns a promise
      chrome.storage.local.set({'contextOptions': _contextOptions}, function() {
        $log.debug('contextOptions written to Storage')
      });
    };

    /**
     * @ngdoc method
     * @name createContextOptionForBookmarkFolder
     * @methodOf newTab.StorageService
     * @description Recursive Function for creating the Configuration of a Context for a Bookmark-Folder
     * @param data
     * @returns {{}}
     */
    var createContextOptionForBookmarkFolder = function(data) {
      var bookmarkFolder = _.filter(data, 'children');
      var result = {};
      _.each(bookmarkFolder, function(item) {
        var childrenOfFolder = _.filter(item.children,function(result){
          return typeof result.children === 'undefined';
        });
        var entry = _.omit(item, 'dateGroupModified', 'dateAdded', 'children');
        entry.color = randomColor();
        entry.active = true;
        entry.children = childrenOfFolder;
        result[item.id] = entry;
        // TODO: Maybe its better to filter empty objects before the recursion
        _.merge(result, createContextOptionForBookmarkFolder(item.children))
      });
      return result;
    };

    /**
     * @ngdoc method
     * @name buildStoredContextUrls
     * @methodOf newTab.StorageService
     * @description Builds Array that references all the Bookmark-Urls to its parentFolder as Context
     * @returns {promise}
     */
    var buildStoredContextUrls = function() {
      var deferred = $q.defer();
      var _storedContextUrls = {};
      var _lastContextIndex = '';

      getStoredContexts().then(function(storedContext) {

        _.each(storedContext, function(context) {
          _.each(context.children, function(contextBookmark) {

            var _subStr = contextBookmark.url.substr(0,17);
            if(typeof _storedContextUrls[_subStr] === 'undefined') {
              _storedContextUrls[_subStr] = contextBookmark.parentId;
            } else if(_lastContextIndex !== contextBookmark.parentId) {
              _storedContextUrls[_subStr] = _storedContextUrls[_subStr]+','+contextBookmark.parentId;
            }
            _lastContextIndex = contextBookmark.parentId;
          });
        });

        chrome.storage.local.set({'storedContextUrls': _storedContextUrls}, function() {
          $log.debug('storedContextUrls have been put to local Storage');
          deferred.resolve(_storedContextUrls);
        });

      });
      return deferred.promise;
    };


    /**
     * @ngdoc method
     * @name filterContextOptionsByUrl
     * @methodOf newTab.StorageService
     * @description Returns filtered ContextOptions that match the first n Characters of a given Url
     * @returns {promise}
     */
    var filterContextOptionsByUrl = function(url) {

      var deferred = $q.defer();
      var stringLength= 20;
      var shortenedUrl = url.substr(0,stringLength);

      getStoredContexts().then(function(storedContext) {

        var filteredContexOptions = _.each(storedContext, function(context) {
          _.filter(context.children, function(contextBookmark){
            return contextBookmark.url.substr(0,stringLength) === shortenedUrl;
          });
        });
        deferred.resolve(filteredContexOptions);

      });
      return deferred.promise;
    };


    /**
     * @ngdoc method
     * @name buildStoredContextUrls
     * @methodOf newTab.StorageService
     * @description Builds Array that references all the Bookmark-Urls to its parentFolder as Context
     * @returns {promise}
     */
    var getContextColor = function(contextID) {

      if(storageData.storedContexts[contextID]) {
        return storageData.storedContexts[contextID].color;
      } else {
        $log.error('Get Color for Context '+contextID+' FAILED');
      }
    };

    /**
     * @ngdoc method
     * @name buildStoredContextUrls
     * @methodOf newTab.StorageService
     * @description Builds Array that references all the Bookmark-Urls to its parentFolder as Context
     * @returns {promise}
     */
    var getContextTitle = function(contextID) {

      if(storageData.storedContexts[contextID]) {
        return storageData.storedContexts[contextID].title;
      } else {
        $log.error('Get Title for Context '+contextID+' FAILED');
      }
    };


    return {
      getStoredContexts: getStoredContexts,
      getContextColor: getContextColor,
      getContextTitle: getContextTitle,
      buildStoredContextUrls: buildStoredContextUrls
    };

  });
