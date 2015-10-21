'use strict';

/**
 * @ngdoc service
 * @name newTab.browserHistory
 * @description
 * Service for getting the Browser History
 */

angular.module('newTab')
  .factory('BrowserHistory', function ($log, $http, $q, configuration, ChromeApi) {

    /**
     * @ngdoc method
     * @name getHistoryWithVisits
     * @methodOf newTab.browserHistory
     * @description Fetches the BrowserHistory and then adds extra Data of the Visits
     * @returns {promise}
     */
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

    /**
     * @ngdoc method
     * @name processVisit
     * @methodOf newTab.browserHistory
     * @description Connect the Data
     * @returns {promise}
     * @param vi
     */
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