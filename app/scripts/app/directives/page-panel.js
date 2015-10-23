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
      templateUrl: 'scripts/app/views/page-panel.html',
      scope: {
        'site':'=',
        'context:':'='
      },
      link: function(scope, element, attrs) {


        scope.getContextColor = function(site) {
          if(site.context) {
            if(site.context.indexOf('neutral') !== 0) {
              //return 'background:'+scope.storedContexts[site.context]['color'];
              return 'background:'+scope.context;
            }
          }
        };

        scope.getContextColorIfBookmark = function(site) {
          if(site.context && site.bookmark) {
            if(site.context.indexOf('neutral') !== 0) {
              return 'background:'+scope.context;
            }
          }
        };

        scope.isTab = function(site) {
          return site.tab;
        };

        scope.getPanelClasses = function(site) {
          var _visited, _bookmark, _tab, _context;

          _bookmark = (site.bookmark) ? 'bookmark' : '';
          _tab = (site.tab) ? 'tab' : '';

          _context = '';

          switch (site.visitCount > 1) {
            case (site.visitCount < 5):
              _visited = 'visits-1';
              break;
            case (site.visitCount >= 5 && site.visitCount < 10):
              _visited = 'visits-2';
              break;
            case (site.visitCount >= 10):
              _visited = 'visits-3';
              break;
          }
          return _visited + ' ' + _bookmark + ' ' + _tab + ' ' + _context;
        };

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

        scope.activateTab = function(tab) {
          $log.debug('trying to activate tab', tab);
          //chrome.browserAction.enable(tab.id);
          chrome.tabs.update(tab.id, {selected: true});
        };



        scope.toggleContext = function(context) {
          $log.debug('Toggle Context', context);
          $log.debug('Toggle Context', deactivatedTabs);

          if(deactivatedTabs[context]) {
            scope.createTabs(context);
          } else {
            scope.deactivateContext(context);
          }
        };

        var deactivatedTabs = [];

        scope.createTabs = function(context) {
          $log.debug('Create Tabs of Context');
          deactivatedTabs[context].forEach(function(tab) {
            chrome.tabs.create(tab, function(callback) {
              delete deactivatedTabs[context];
              //deactivatedTabs[context] = '';
              $log.debug('Tab created', callback);
            });
          });
        };

        scope.deactivateContext = function(context) {
          $log.debug('Deactivate Context / close all Tabs');
          var removeTabs = [];
          var indexesOfTabsToRemove = [];
          scope.allSites.forEach(function(site) {
            if(site.tab && site.context === context) {
              var tabToRemove = {
                windowId: site.tab.windowId,
                index: site.tab.id,
                url: site.url,
                active: site.tab.active,
                pinned: site.tab.pinned,
                openerTabId: site.tab.openerTabId
              };
              removeTabs.push(tabToRemove);
              indexesOfTabsToRemove.push(site.tab.id);
            }
          });
          chrome.tabs.remove(indexesOfTabsToRemove, function(){
            deactivatedTabs[context] = removeTabs;
            $log.debug('Tabs removed');

          });
        };


      }
    }


  });
