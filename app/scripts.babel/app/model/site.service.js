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
      var deferredHistory = $q.defer();

      ChromeApi.getStorage('tabConnections')
        .then(function(tabconnections) {
          ChromeApi.getHistory().then(function(sites) {

            var sitesToRetrieve = [];

            sites.reverse().forEach(function(siteData) {


              // Set Bookmark & Bookmark-Context if found
              chrome.bookmarks.search({url: siteData.url}, function(foundBookmark) {
                //TODO (optional): length > 2 would mean Site is more than once bookmarked
                if (foundBookmark.length > 0) {
                  siteData.context = foundBookmark[0]['parentId'];
                  siteData.bookmark = foundBookmark[0]['id'];
                  // more options are: alternative Title, Date added
                }

                // Set Tabs if found
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

                  var site = scope._retrieveInstance(siteData.id, siteData);
                  sitesToRetrieve.push(site);

                  deferredHistory.resolve(sites);

                });
              });



            });

          })
        });
      return deferredHistory.promise;
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
    }
  };

  return sitesManager;
});