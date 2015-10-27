'use strict';

/**
 * @ngdoc directive
 * @name newTa .directive:panel
 * @restrict EA
 * @scope
 * @description
 * Displays a Panel
 *
 * @Example
 * <page-panel site="site" context="context"></page-panel>
 *
 */

angular.module('newTab')
  .directive('pagePanel', function($log) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'views/page-panel.html',
      scope: {
        'site':'='
      },
      link: function(scope, element, attrs) {


        /**
         * @ngdoc method
         * @name getContextColor
         * @methodOf newTab.pagePanel
         * @description Returns Background-Style for Context-Color
         * @returns {string} Background-Style for Context
         */
        scope.getContextColor = function() {
          if(typeof scope.site.context !== 'undefined' ) {
            if(scope.site.context.indexOf('neutral') !== 0) {
              return 'background:'+scope.$parent.contextOptions[scope.site.context].color;
            }
          }
        };

        /**
         * @ngdoc method
         * @name getContextColorIfBookmark
         * @methodOf newTab.pagePanel
         * @description Return the Background-Style of a Context if site is set as Bookmark
         * @returns {string} Background-Style for Context if Bookmark
         */
        scope.getContextColorIfBookmark = function() {
          //if(typeof scope.site.context !== 'undefined' && scope.site.bookmark) {
          //  if(scope.site.context.indexOf('neutral') !== 0) {
          //    return 'background:'+scope.$parent.contextOptions[scope.site.context].color;
          //  }
          //}
        };

        /**
         * @ngdoc method
         * @name isTab
         * @methodOf newTab.pagePanel
         * @description Checks if site is opened as tab
         * @returns {object} Object if tab is set or else undefined
         */
        scope.isTab = function() {
          return scope.site.tab;
        };

        /**
         * @ngdoc method
         * @name getPanelClasses
         * @methodOf newTab.pagePanel
         * @description Sets all the different possible classes for a panel-page
         * @returns {string}
         */
        scope.getPanelClasses = function() {
          var _classes;
          _classes = (scope.site.bookmark) ? 'bookmark ' : '';
          _classes += (scope.site.tab) ? 'tab ' : '';
          // sets substring as class
          _classes += scope.site.url.substr(scope.site.url.indexOf('://')+3,12).split('.').join('_')+' ';
          // sets file ending as class
          _classes += (scope.site.url.substr(-4,1) === '.') ? scope.site.url.substr(-3,3)+' ' : '';
          switch (scope.site.visitCount > 1) {
            case (scope.site.visitCount < 5):
              _classes += 'visits-1';
              break;
            case (scope.site.visitCount >= 5 &&scope.site.visitCount < 10):
              _classes += 'visits-2';
              break;
            case (scope.site.visitCount >= 10):
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
        scope.setBookmark = function() {
          if(scope.site.bookmark) {
            chrome.bookmarks.remove(scope.site.bookmark, function(result) {
              $log.debug("Bookmark removed:", result);
              scope.site.bookmark = false;
            });
          } else {
            chrome.bookmarks.create({'parentId':scope.site.context,
              'title':scope.site.title,
              'url':scope.site.url
            }, function(result) {
              $log.debug("Bookmark added:", result);
              scope.site.bookmark = result.id;
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
        scope.activateTab = function(site) {
          $log.debug('trying to activate tab', site.tab);
          chrome.tabs.update(site.tab.id, {selected: true});
        };

        /**
         * @ngdoc method
         * @name closeTab
         * @methodOf newTab.pagePanel
         * @description Closes the tab
         */
        scope.closeTab = function() {
          $log.debug('trying to close tab',scope.site);
          chrome.tabs.remove(scope.site.tab.id, function(result){
            $log.debug('Tab Closed', result);
            delete scope.site.tab;
          });
        };

        /**
         * @ngdoc method
         * @name openContent
         * @methodOf newTab.pagePanel
         * @description activates existing Tabs or else opens Url in active Window/Tab
         */
        scope.openContent = function() {
          if(scope.site.tab) {
            scope.activateTab(tab);
          } else {
            window.location = scope.site.url;
          }
        };

        /**
         * @ngdoc method
         * @name getTitle
         * @methodOf newTab.pagePanel
         * @returns {*}
         * @description Returns title or edited Version of Title if its empty
         */
        scope.getTitle = function() {
          scope.site.title = scope.site.title.split(' - Google-Suche')[0];
          return scope.site.title !== '' ? scope.site.title : scope.site.url.split('#')[1];
        };






        /**
         * @ngdoc method
         * @name toggleContext
         * @methodOf newTab.pagePanel
         * @description Toggles the activity of a context
         * @param {object} context
         */
        scope.toggleContext = function(context) {
          $log.debug('Toggle Context', context);
          $log.debug('Toggle Context', deactivatedTabs);

          if(deactivatedTabs[context]) {
            scope.createTabs(context);
          } else {
            scope.deactivateContext(context);
          }
        };


      }
    }
  });
