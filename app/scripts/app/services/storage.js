'use strict';

/**
 * @ngdoc service
 * @name newTab.Storage
 * @description
 * Service for getting the Browser Storage
 */

angular.module('newTab').service('Storage', function ($log, $http, $q, configuration, ChromeApi) {

  /**
   * @ngdoc method
   * @name getStoredContexts
   * @methodOf newTab.Storage
   * @description Checks if Context-Configuration already exists in the Storage - If not creates it
   * @returns {promise}
   */
  var getStoredContexts = function getStoredContexts() {
    var deferred = $q.defer();
    ChromeApi.getBookmarks().then(function (bookmarks) {
      ChromeApi.getStorage('contextOptions').then(function (contextOptions) {
        $log.debug('Context Options found');
        //TODO: For now Options are rewritten with every reload for Setting up the correct settings
        writeContextOptions(bookmarks);
        deferred.resolve(contextOptions);
      }, function (error) {
        $log.debug('Building New Context Options');
        writeContextOptions(bookmarks);
      });
    });
    return deferred.promise;
  };

  /**
   * @ngdoc method
   * @name writeContextOptions
   * @methodOf newTab.Storage
   * @description
   * @param bookmarks
   */
  var writeContextOptions = function writeContextOptions(bookmarks) {
    //TODO: Maybe this can be put into the getStoredContext-method later
    var _contextOptions = setupContextOptions(bookmarks);
    //TODO: This needs to be put as a function to the ChromeApi that returns a promise
    chrome.storage.local.set({ 'contextOptions': _contextOptions }, function () {});
  };

  /**
   * @ngdoc method
   * @name setupContextOptions
   * @methodOf newTab.Storage
   * @description Recursive Function for writing Context Configuration Data in the Storage
   * @param data
   * @returns {{}}
   */
  var setupContextOptions = function setupContextOptions(data) {
    var bookmarkFolder = _.filter(data, 'children');
    var result = {};
    _.each(bookmarkFolder, function (item) {
      var entry = _.omit(item, 'id', 'dateGroupModified', 'dateAdded', 'children');
      entry.color = randomColor();
      result[item.id] = entry;
      // TODO: Maybe its better to filter empty objects before the recursion
      _.merge(result, setupContextOptions(item.children));
    });
    return result;
  };

  return {
    getStorageBytesInUse: ChromeApi.getStorageBytesInUse,
    getStorage: ChromeApi.getStorage,
    getStoredConfiguration: ChromeApi.getStoredConfiguration,
    getStoredContexts: getStoredContexts
  };
});
//# sourceMappingURL=storage.js.map
