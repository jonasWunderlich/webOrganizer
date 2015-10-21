'use strict';

/**
 * @ngdoc service
 * @name newTab.browserHistory
 * @description
 * # browserHistory
 * Service for getting the Browser History
 */
angular.module('newTab')
  .factory('BrowserHistory', function ($log, $http, $q, configuration, ChromeApi) {

    var getHistoryWithVisits = function() {
      var deferredHistory = $q.defer();
      ChromeApi.getStorage('tabConnections')
        .then(function(tabconnections) {
          ChromeApi.getHistory().then(function(sites) {
            var i = 0;
            sites.reverse().forEach(function(site) {
              ChromeApi.getVisits(site).then(function(visits){
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
      //$log.debug(vi.id);
      // TODO: filter unwanted sites / urls
      // TODO: get Relevance
      // TODO: connect linked sites with visitItems
      // TODO: connect linked sites with tabConnections
      // TODO: find Bookmarks & write Context
      // TODO: mark tabs
      // TODO: special filters for special sites
    };

    return {
      getHistoryWithVisits: getHistoryWithVisits,
      getBookmarks: ChromeApi.getBookmarks,
      getOpenTabs: ChromeApi.getOpenTabs
    };

  });