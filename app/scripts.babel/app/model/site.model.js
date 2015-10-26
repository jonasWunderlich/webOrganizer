'use strict';
/* global $, _ */

/**
 * @ngdoc service
 * @name newTab.SiteModel
 * @description
 * SiteModel
 *
 */

angular.module('newTab')
  .factory('SiteModel', function ($log, $q) {


    function Site(dataObj) {
      if (dataObj) {
        this.setData(dataObj);
      }
      // Some other initializations related to Site
    }

    /**
     * @ngdoc method
     * @name setData
     * @methodOf newTab.pagePanel
     * @description Sets Data of History to Site
     */
    Site.prototype.setData = function(dataObj) {
      this.model = {};
      this.model.state = "initialised";
      this.model.visibility = true;
      angular.extend(this, dataObj);
    };

    /**
     * @ngdoc method
     * @name delete
     * @methodOf newTab.pagePanel
     * @description Deletes Site from History
     * @return {promise}
     */
    Site.prototype.deleteSite = function() {
      var deferred = $q.defer();
      chrome.history.deleteUrl(this.site.url, function(){
        $log.debug('Site has been deleted from History', this.site);
        deferred.resolve(true);
      });
      return deferred.promise();
    };

    /**
     * @ngdoc method
     * @name getTitle
     * @methodOf newTab.pagePanel
     * @returns {*}
     * @description Returns title or edited Version of Title if its empty
     */
    Site.prototype.getTitle = function() {
      this.site.title = this.site.title.split(' - Google-Suche')[0];
      return this.site.title !== '' ? this.site.title : this.site.url.split('#')[1];
    };

    /**
     * @ngdoc method
     * @name getPanelClasses
     * @methodOf newTab.pagePanel
     * @description Sets all the different possible classes for a panel-page
     * @returns {string}
     */
    Site.prototype.getPanelClasses = function() {
      var _classes = (this.site.bookmark) ? 'bookmark ' : '';
      _classes += (this.site.tab) ? 'tab ' : '';
      // sets substring as class
      _classes += this.site.url.substr(this.site.url.indexOf('://')+3,12).split('.').join('_')+' ';
      // set file ending as class
      _classes += (this.site.url.substr(-4,1) === '.') ? this.site.url.substr(-3,3)+' ' : '';
      switch (this.site.visitCount > 1) {
        case (this.site.visitCount < 5):
          _classes += 'visits-1';
          break;
        case (this.site.visitCount >= 5 &&this.site.visitCount < 10):
          _classes += 'visits-2';
          break;
        case (this.site.visitCount >= 10):
          _classes += 'visits-3';
          break;
      }
      return _classes;
    };

    /**
     * @ngdoc method
     * @name setBookmark
     * @methodOf newTab.pagePanel
     * @description removes existing Bookmark or creates it in the surrounded Context
     */
    Site.prototype.setBookmark = function() {
      if(this.site.bookmark) {
        chrome.bookmarks.remove(this.site.bookmark, function(result) {
          $log.debug("Bookmark removed:", result);
          this.site.bookmark = false;
        });
      } else {
        chrome.bookmarks.create({'parentId':this.site.context,
          'title':this.site.title,
          'url':this.site.url
        }, function(result) {
          $log.debug("Bookmark added:", result);
          this.site.bookmark = result.id;
        });
      }
    };

    /**
     * @ngdoc method
     * @name activateTab
     * @methodOf newTab.pagePanel
     * @param tab
     * @description activates the Tab on the selected Site
     */
    Site.prototype.activateTab = function(tab) {
      $log.debug('trying to activate tab', tab);
      chrome.tabs.update(tab.id, {selected: true});
    };

    /**
     * @ngdoc method
     * @name closeTab
     * @methodOf newTab.pagePanel
     * @description Closes the tab
     */
    Site.prototype.closeTab = function() {
      $log.debug('trying to close tab',this.site);
      chrome.tabs.remove(this.site.tab.id, function(result){
        $log.debug('Tab Closed', result);
        delete this.site.tab;
      });
    };

    /**
     * @ngdoc method
     * @name getContextColor
     * @methodOf newTab.pagePanel
     * @description Returns Background-Style for Context-Color
     * @returns {string} Background-Style for Context
     */
    Site.prototype.getContextColor = function() {
      return 'background:'+this.site.context;
    };

    /**
     * @ngdoc method
     * @name isTab
     * @methodOf newTab.pagePanel
     * @description Checks if site is opened as tab
     * @returns {object} Object if tab is set or else undefined
     */
    Site.prototype.siteIsTab = function() {
      return this.site.tab;
    };

    /**
     * @ngdoc method
     * @name getFavicon
     * @methodOf newTab.pagePanel
     * @description Returns Favicon in Chrome-Cache
     * @returns {String} link to favicon-resource
     */
    Site.prototype.getFavicon = function() {
      return 'chrome://favicon/'+site.url;
    };














    /**
     * @ngdoc method
     * @name openContent
     * @methodOf newTab.pagePanel
     * @description activates existing Tabs or else opens Url in active Window/Tab
     */
    Site.prototype.openContent = function() {
      if(this.site.tab) {
        this.activateTab(tab);
      } else {
        window.location = this.site.url;
      }
    };

    /**
     * @ngdoc method
     * @name toggleContext
     * @methodOf newTab.pagePanel
     * @description Toggles the activity of a context
     * @param {object} context
     */
    Site.prototype.toggleContext = function(context) {
      $log.debug('Toggle Context', context);
      $log.debug('Toggle Context', deactivatedTabs);

      if(deactivatedTabs[context]) {
        this.createTabs(context);
      } else {
        this.deactivateContext(context);
      }
    };


    return Site;

  });