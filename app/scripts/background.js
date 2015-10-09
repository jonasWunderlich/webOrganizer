'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({ text: 'Hello' });

console.log('This is the backtround.js');
//# sourceMappingURL=background.js.map

chrome.contextMenus.create({
  title: 'This is your chrome extension menu!',
  id: 'selectFromContextMenu',
  contexts: ['all']
}, function () {
  var error = chrome.runtime.lastError;
  if (error) {
    console.log(error);
  } else {
    console.log('Context menu created');
  }
});

chrome.contextMenus.onClicked.addListener(function (tab) {
  console.log(tab);
  // alert('Hello world');
});

// This is the background-functionality or the old navigator
var setTabConnection;
var lastPage = '';
var tabConnections = {};

chrome.storage.local.get('tabConnections', function (result) {
  if (result.tabConnections !== null) {
    tabConnections = result.tabConnections;
    return tabConnections;
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    return setTabConnection(tab.url, tab.openerTabId);
  }
});

/**
 * [setTabConnection description]
 * @param {[type]} newTabUrl   [description]
 * @param {[type]} openerTabId [description]
 */
setTabConnection = function (newTabUrl, openerTabId) {
  var visit = 0;
  if (typeof openerTabId !== 'undefined') {
    return chrome.tabs.get(openerTabId, function (openertab) {
      if (openertab.url !== 'chrome://newtab/' && newTabUrl !== 'chrome://newtab/') {
        return chrome.history.getVisits({
          url: newTabUrl
        }, function (visitItems) {
          if (visitItems.length > 0) {
            visit = visitItems[visitItems.length - 1].visitId;
            return chrome.history.getVisits({
              url: openertab.url
            }, function (visitItems) {
              tabConnections[visit] = visitItems[visitItems.length - 1].visitId;
              return chrome.storage.local.set({
                'tabConnections': tabConnections
              });
            });
          }
        });
      }
    });
  }
};

chrome.webNavigation.onCommitted.addListener(function (details) {
  if (details.transitionQualifiers) {
    if (details.transitionQualifiers === 'forward_back') {
      lastPage = details.url;
      return lastPage;
    }
  }
});
//# sourceMappingURL=background.js.map
