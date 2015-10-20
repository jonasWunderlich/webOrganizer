'use strict';

/**
 * @ngdoc service
 * @name newTab.browserHistory
 * @description
 * # browserHistory
 * Service for getting the Browser History
 */
angular.module('newTab')
  .factory('BrowserHistory', function ($log, $http, $q, $rootScope, configuration) {
    // AngularJS will instantiate a singleton by calling "new" on this function

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


    var getStorage = function(variable) {
      var deferred = $q.defer();
      chrome.storage.local.get(variable, function(response) {
        if (response[variable]) {
          $log.debug('Storage data retrieved:', response);
          deferred.resolve(response[variable])
        } else {
          $log.debug('Unable to retrieve Storage data', response);
          deferred.reject('unable to retrieve Storage data')
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
          $log.debug('getVisits data retrieved:', response);
          deferred.resolve(response);
        } else {
          $log.debug('Unable to retrieve getVisits', response);
          deferred.reject('Unable to retrieve getVisits');
        }
      });
      return deferred.promise;
    };

    var getHistoryWithVisits = function() {
      var deferredHistory = $q.defer();
      getStorage('tabConnections')
        .then(function(tabconnections) {
          getHistory().then(function(sites) {
            var i = 0;
            sites.reverse().forEach(function(site) {
              getVisits(site).then(function(visits){
                site.visits = visits.slice(0, configuration.getMaxVisits());
              });
              i++;
              processVisit(site);
              if(i===sites.length) {
                deferredHistory.resolve(sites);
              }
            });
          })
        });
      return deferredHistory.promise;
    };

    var processVisit = function(vi) {
      $log.debug(vi.id);
      // TODO: filter unwanted sites / urls
      // TODO: get Relevance
      // TODO: connect linked sites with visitItems
      // TODO: connect linked sites with tabConnections
      // TODO: find Bookmarks & write Context
      // TODO: mark tabs
      // TODO: special filters for special sites
    };

    return {
      getHistory: getHistory,
      getBookmarks: getBookmarks,
      getHistoryWithVisits: getHistoryWithVisits
    };

  });