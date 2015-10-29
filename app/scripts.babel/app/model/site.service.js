'use strict';
/* global _ */

/**
 * @ngdoc factory
 * @name newTab.sitesManager
 * @description
 * sitesManager is a low-level class for communicating with the web api.
 *
 */

angular.module('newTab')
  .service('sitesManager', function (Site, $q, $http, $log, ChromeApi) {


  var sitesManager = {

    _pool: {},

    _retrieveInstance: function(siteId, siteData) {
      var instance = this._pool[siteId];
      if (instance) {
        instance.setData(siteData);
      } else {
        instance = new Site(siteData);
        this._pool[siteId] = instance;
      }
      return instance;
    },

    _search: function(siteId) {
      return this._pool[siteId];
    },

    /*Adds Url to history with the actual time */
    _load: function(siteUrl, deferred) {
      var scope = this;
      chrome.history.addUrl(siteUrl, function(siteData){
        var site = scope._retrieveInstance(siteData.id, siteData);
        deferred.resolve(site);
      });
    },

    /* Public Methods */
    /* Use this function in order to get a site instance by it's id */
    getSite: function(siteId) {
      var deferred = $q.defer();
      var site = this._search(siteId);
      if (site) {
        deferred.resolve(site);
      } else {
        this._load(siteId, deferred);
      }
      return deferred.promise;
    },

    /*  This function is useful when we got somehow the site data and we wish to store it or update the pool and get a site instance in return */
    setSite: function(siteData) {
      var scope = this;
      var site = this._search(siteData.id);
      if (site) {
        site.setData(siteData);
      } else {
        site = scope._retrieveInstance(siteData);
      }
      return site;
    },

    /* Use this function in order to get instances of all the sites */
    loadAllSites: function() {
      var scope = this;
      var deferredHistory = $q.defer();
      ChromeApi.getStorage('tabConnections')
        .then(function(tabconnections) {
          ChromeApi.getHistory().then(function(sites) {

            var sitesToRetrieve = [];
            sites.reverse().forEach(function(siteData) {

              var site = scope._retrieveInstance(siteData.id, siteData);
              sitesToRetrieve.push(site);
              deferredHistory.resolve(sites);
            });
          })
        });
      return deferredHistory.promise;
    },








    /* Use this function in order to get instances of all the sites */
    loadAllSitesEnhanced: function() {

      var scope = this;
      var deferred = $q.defer();

      var domainIndex = 0;
      var domainCollector = {};
      var indexNeutralContext = 0;
      var lastCheckedSite = {};


      $q.all([
        ChromeApi.getHistory(),
        ChromeApi.getStorage('storedContextUrls'),
        ChromeApi.getStorage('contextOptions')
      ]).then(function(data) {

        var sites = data[0];
        var storedContextUrls = data[1];
        var contextOptions = data[2];

        var i = 0;
        var sitesToRetrieve = [];

        sites.reverse().forEach(function (siteData) {

          /**
           * Set Bookmark & Bookmark-Context if found
           */
          chrome.bookmarks.search({url: siteData.url}, function (foundBookmark) {
            if (foundBookmark.length > 0) {
              siteData.context = foundBookmark[0]['parentId'];
              siteData.bookmark = foundBookmark[0]['id'];
              // more options are: alternative Title, Date added
              if (foundBookmark.length > 1) {
                //TODO (optional): length > 1 would mean Site is more than once bookmarked
                $log.debug('duplicate bookmark found', foundBookmark);
              }
            }
            else {
              if(siteData.url.substr(0,28) === 'https://www.google.de/search') {
                lastCheckedSite.context = siteData.context = 'neutral-' + indexNeutralContext;
                indexNeutralContext++;
              } else {
                var _subStringOfSiteDataUrl = siteData.url.substr(0,17);
                siteData.context = storedContextUrls[_subStringOfSiteDataUrl];
              }

            }


            /**
             * Set Tabs if found
             */
            chrome.tabs.query({url: siteData.url}, function (foundTab) {
              if (foundTab.length > 0) {
                siteData.tab = foundTab[0];
              }

              //TODO: Check this Functionality
              //ChromeApi.getVisits(siteData).then(function(visits) {
              //  //TODO: reduce amout of visitItems but (not with slice)
              //  //siteData.visits = visits.slice(0, configuration.getMaxVisits());
              //  siteData.visits = visits;
              //  siteData.visits.forEach(function(visit) {
              //
              //    if(visit.referringVisitId === "0" && visit.transition === "link") {
              //      //TODO: find a way to set the still missing references (Find a PATTERN!)
              //      if(tabconnections[visit.visitId]) {
              //        //$log.debug('found tab reference:', tabconnections[visit.visitId]);
              //        //$log.debug('for', siteData.url);
              //        visit.referringVisitId = tabconnections[visit.visitId];
              //        siteData.refByNewTab = true;
              //      }
              //    }
              //    if(visit.transition === "reload") {
              //      siteData.reload = true;
              //      //TODO: find the orginal source of reloaded visits
              //    }
              //  });
              //});



              if (!siteData.context) {

                /**
                 * Collect Subset of URLs for linking Pages that have no referringVisitId
                 */

                if (domainIndex > 0 && siteData.url.substr(0, 20) === lastCheckedSite.url.substr(0, 20)) {

                  if (lastCheckedSite.context) {
                    if (siteData.context) {
                      //TODO: If siteData.context exists what happens to this context?
                    }
                    siteData.context = lastCheckedSite.context;
                  } else {
                    if (siteData.context) {
                      lastCheckedSite.context = siteData.context;
                      //TODO: Check if this has any implications
                    } else {
                      lastCheckedSite.context = siteData.context = 'neutral-' + indexNeutralContext;
                      indexNeutralContext++;
                      //TODO: Check if this has any implications
                    }
                  }
                }
                domainIndex++;
                lastCheckedSite = siteData;
                // TODO: Don't just check the Site before - but all the sites
                domainCollector[domainIndex] = siteData.url.substr(0, 20);
              }

              var site = scope._retrieveInstance(siteData.id, siteData);
              sitesToRetrieve.push(site);

              i++;

              if (i === sites.length) {

                var contextArray = _.chain(sites)
                  .groupBy("context")
                  .pairs()
                  .map(function(currentItem) {
                    return _.object(_.zip(["context", "sites"], currentItem));
                  })
                  .value();

                //var r2 = _.map(contextOptions, function(item){
                //  return _.extend(item, _.findWhere(contextArray, { id: item.context }));
                //});

                //var r2 = _.forEach(contextArray, function(item){
                //  $log.debug("id found",item.context);
                //  var cid = item.context;
                //  $log.debug("id found",contextOptions.cid);
                //  if(typeof contextOptions[item.context] !== 'undefined') {
                //    item.id = contextOptions[item.context].id;
                //  }
                //});
                //$log.debug("NEW",r2);

                //result.color = contextOptions[result.context];
                //result.color = "asdf";
                //$log.debug(r2);
                //$log.debug(sites);
                //$log.debug(contextOptions);
                //$log.debug(contextArray);

                deferred.resolve(contextArray);
                //deferred.resolve(sites);


              }



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
    }














  };

  return sitesManager;
});


