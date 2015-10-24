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
        'site':'=',
        'context:':'='
      },
      link: function(scope, element, attrs) {

        /**
         *
         * @param site
         * @returns {string}
         */
        scope.getContextColor = function(site) {
          if(site.context) {
            if(site.context.indexOf('neutral') !== 0) {
              return 'background:'+scope.context;
            }
          }
        };

        /**
         *
         * @param site
         * @returns {string}
         */
        scope.getContextColorIfBookmark = function(site) {
          if(site.context && site.bookmark) {
            if(site.context.indexOf('neutral') !== 0) {
              return 'background:'+scope.context;
            }
          }
        };

        /**
         *
         * @param site
         * @returns {$.tab|tab|$.fn.tab.$.tab}
         */
        scope.isTab = function(site) {
          return site.tab;
        };

        /**
         *
         * @param site
         * @returns {string}
         */
        scope.getPanelClasses = function(site) {

          var _classes;

          _classes = (site.bookmark) ? 'bookmark ' : '';
          _classes += (site.tab) ? 'tab ' : '';
          _classes += site.url.substr(site.url.indexOf('://')+3,12).split('.').join('_')+' ';

          _classes += (site.url.substr(-4,1) === '.') ? site.url.substr(-3,3)+' ' : '';

          switch (site.visitCount > 1) {
            case (site.visitCount < 5):
              _classes += 'visits-1';
              break;
            case (site.visitCount >= 5 && site.visitCount < 10):
              _classes += 'visits-2';
              break;
            case (site.visitCount >= 10):
              _classes += 'visits-3';
              break;
          }
          return _classes;
        };

        ///**
        // *
        // * @param site
        // * @returns {string}
        // */
        //scope.getPanelContentClasses = function(site) {
        //
        //  var _classes, _urlClass;
        //
        //  _urlClass = site.url.substr(site.url.indexOf('://')+3,12).split('.').join('_');
        //  _classes = _urlClass+' ';
        //  //$log.debug(_urlClass);
        //
        //  return _classes;
        //};

        /**
         *
         * @param site
         */
        scope.setBookmark = function(site) {
          if(site.bookmark) {
            chrome.bookmarks.remove(site.bookmark, function(result) {
              $log.debug("Bookmark removed:", result);
              site.bookmark = false;
            });
          } else {
            chrome.bookmarks.create({'parentId': site.context,
              'title': site.title,
              'url': site.url
            }, function(result) {
              $log.debug("Bookmark added:", result);
              site.bookmark = result.id;
            });
          }
        };

        /**
         *
         * @param tab
         */
        scope.activateTab = function(tab) {
          $log.debug('trying to activate tab', tab);
          chrome.tabs.update(tab.id, {selected: true});
        };

        /**
         *
         * @param site
         */
        scope.closeTab = function(site) {
          $log.debug('trying to close tab', site);
          chrome.tabs.remove(site.tab.id, function(result){
            $log.debug('Tab Closed', site);
            delete site.tab;
          });
        };

        /**
         *
         * @param context
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

        /**
         *
         * @param site
         */
        scope.openContent = function(site) {
          if(site.tab) {
            scope.activateTab(tab);
          } else {
            window.location = site.url;
          }
        };

        scope.getTitle = function() {
          $log.debug(scope.site.title !== '');
          scope.site.title = scope.site.title.split(' - Google-Suche')[0];
          return scope.site.title !== '' ? scope.site.title : scope.site.url.split('#')[1];
        }

      }
    }
  });
