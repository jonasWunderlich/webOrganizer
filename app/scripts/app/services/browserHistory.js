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
     * @description Fetches the BrowserHistory and then adds to every PageInfo extra Data about the individual Visits
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
     */
    var getProcessedHistory = function() {

      var deferred = $q.defer();
      // Vorraussetzungen: History+VisitItems / TabConnections / Bookmarks / Context-Options

      $q.all([
        getHistoryWithVisits(),
        ChromeApi.getBookmarks(),
        ChromeApi.getOpenTabs(),
        ChromeApi.getStorage()
      ]).then(function(data) {
        var history = data[0];
        var bookmarks = data[1];
        var tabs = data[2];
        var configuration = data[3];
        $log.debug('got everything I need', data);

        // I: First Loop:
        history.forEach(function(site) {
          // I.A  Set Bookmark & Context if found
          chrome.bookmarks.search({url: site.url}, function(foundBookmark) {
            //TODO (optional): length > 2 would mean Site is more than once bookmarked
            if(foundBookmark.length > 0) {
              site.context = foundBookmark[0]['parentId'];
              site.bookmark = foundBookmark[0]['id'];
              // more options are: alternative Title, Date added
            }
            // I.B Set Tabs if found
            chrome.tabs.query({url: site.url}, function(foundTab) {
              if(foundTab.length > 0) {
                site.tabOpen = foundTab[0];
                $log.debug(site);
              }

              

              // TODO: connect linked sites with visitItems
              // TODO: connect linked sites with tabConnections
              // Verknüpfung prüfen
              //  - falls VID = 0 & transition link: Tabconnections ergänzen (verweis auf VisitID)
              //  - Alle VisitItems in der History nach Ref durchsuchen
              //  - Bei Treffer:
              //      Szenario A: Fund hat keinen Kontext: Fund auch auf Kontext setzen
              //      Szenario B: Fund hat Kontext: Kontext von Fund übernehmen (!! Prüfen ob 2. Kontext besteht - Wie ist mir noch unklar !!)
              // Sichtbarkeit setzen (unwichtig/weiterleitung)
              // Verschieben in Kontext
              // Warnung bei Kontext hierarchie & doppeltbelegung


              deferred.resolve(history.reverse());
            });
          });


        });


      });

      // 2. Durchlauf (Iteration mit Tiefe n)
      // Seiten ohne Kontext(geht das noch nach dem 1. Durchlauf)

      // Prüfen ob Kontexte zusammenpassen
      // Gleicher Ordner
      // Zeitlicher Abstand ~vorsichtig genießen
      // Vereinfachungen durch URL-Ähnlichkeit

      // TODO: special filters for special sites
      // Schnittstelle für Ausnahmeregelungen einplanen:
      // Facebook, GMail, Google, Stackoverflow, GoogleDrive, Drupal, Wordpress etc.

      // TODO: filter unwanted sites / urls

      return deferred.promise;
    };

    return {
      getHistoryWithVisits: getHistoryWithVisits,
      getProcessedHistory: getProcessedHistory,
      getBookmarks: ChromeApi.getBookmarks,
      getOpenTabs: ChromeApi.getOpenTabs
    };

  });