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
                //TODO: reduce amout of visitItems but (not with slice :-P)
                //site.visits = visits.slice(0, configuration.getMaxVisits());
                site.visits = visits;
                site.visits.forEach(function(visit) {

                  if(visit.referringVisitId === "0" && visit.transition === "link") {
                    //TODO: find a way to set the still missing references (Find a PATTERN!)
                    if(tabconnections[visit.visitId]) {
                      //$log.debug('found tab reference:', tabconnections[visit.visitId]);
                      //$log.debug('for', site.url);
                      visit.referringVisitId = tabconnections[visit.visitId];
                      site.refByNewTab = true;
                    }
                  }
                  if(visit.transition === "reload") {
                    site.reload = true;
                    //TODO: find the orginal source of reloaded visits
                  }
                });
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

      $q.all([
        getHistoryWithVisits(),
        ChromeApi.getBookmarks(),
        ChromeApi.getOpenTabs(),
        ChromeApi.getStorage()
      ]).then(function(data) {

        $log.debug('Starting to Process advanced PageHistory');

        var history = data[0];
        var bookmarks = data[1];
        var tabs = data[2];
        var configuration = data[3];

        var domainIndex = 0;
        var domainCollector = {};
        var indexNeutralContext = 0;

        // I: First Loop:
        history.forEach(function(site) {

          /**
           * Collect Subset of URLs for linking Pages that have no referringVisitId
           */
          domainCollector[domainIndex] = site.url.substr(0, 20);
          domainIndex++;
          //$log.debug('DomainCollector',domainCollector);

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
                site.tab = foundTab[0];
              }

              //var found = _.where(history, { 'visits': { 'referringVisitId': site.visits[0]['visitId']}});
              //$log.debug('search reference for', site.url);
              site.visits.some(function(visit) {
                return history.some(function(historyItem) {
                  return historyItem.visits.some(function(historyVisitItem) {
                    var _foundReference = (visit.referringVisitId === historyVisitItem.visitId && visit.id !== historyVisitItem.id);
                    if (_foundReference) {
                      site.FOUNDTHEREFERENCE = historyItem.url;
                      //$log.debug('FOUND - Site', site);
                      //$log.debug('FOUND - hi', historyItem);
                      /**
                       * Here happens some important magic:
                       * if we find a link-reference to an existing page we lookup if the found page has already a context
                       * if so we take this context for this site
                       * if not we give them both a new context
                       */
                      if(historyItem.context) {
                        if (site.context) {
                          //TODO: If site.context exists what happens to this context?
                        }
                        site.context = historyItem.context;
                      } else {
                        if (site.context) {
                           historyItem.context = site.context;
                          //TODO: Check if this has any implications
                        } else {
                          historyItem.context = site.context = 'neutral-'+indexNeutralContext;
                          indexNeutralContext++;
                          //TODO: Check if this has any implications
                        }
                      }
                    }
                    return _foundReference;
                  });
                });
              });


              if(!site.context) {
                //console.log(site.url);
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