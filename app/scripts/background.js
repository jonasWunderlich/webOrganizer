'use strict';

/**
 * @name setBadgeText
 * @description Writes the Text into the Badge beneath the Plugin-Icon
 * @param text
 */
function setBadgeText(text) {
  chrome.browserAction.setBadgeText({ text: text });
}

function listenToTabEvents() {

  var lastPage = '';
  var tabConnections = {};

  tabConnections = chrome.storage.local.get('tabConnections', function (result) {
    if (result.tabConnections !== null) {
      console.log('Retrieved existing TabConnections from storage');
      tabConnections = result.tabConnections;
      //return tabConnections;
    }
  });

  /**
   * @name setTabConnnection
   * @description
   * @param {object} tab   [The Tab that was opened (hopefully)]
   */
  function setTabConnection(tab) {

    // Check for openerTabId: that tells us a new Tab was actually created [by an existing Tab]
    if (typeof tab.openerTabId !== 'undefined') {
      console.log('tab opened: ', tab.url);

      // Get the openerTab
      return chrome.tabs.get(tab.openerTabId, function (openerTab) {
        if (openerTab.url !== 'chrome://newtab/' && tab.url !== 'chrome://newtab/') {

          // Get the Visits of the new Tab
          return chrome.history.getVisits({ url: tab.url }, function (visits) {
            if (visits.length > 0) {
              var lastVisitId = visits[visits.length - 1].visitId;

              // Get the Visits of the openerTab
              return chrome.history.getVisits({ url: openerTab.url }, function (openerVisits) {
                // Write the Connection between the Tabs in the Storage
                var openerLastVisitId = openerVisits[openerVisits.length - 1].visitId;
                tabConnections[lastVisitId] = openerLastVisitId;
                console.log('Writing Connection: VisitId ' + lastVisitId + ' was opened by ' + openerLastVisitId);
                return chrome.storage.local.set({ 'tabConnections': tabConnections });
              });
            }
          });
        }
      });
    }
  }

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // Get the already existing TabConnections from Storage
    if (changeInfo.status === 'complete') {
      return setTabConnection(tab);
    }
  });

  chrome.webNavigation.onCommitted.addListener(function (details) {
    if (details.transitionQualifiers) {
      if (details.transitionQualifiers === 'forward_back') {
        lastPage = details.url;
        return lastPage;
      }
    }
  });
}

function setupStorage() {
  chrome.storage.local.get(function (response) {

    if (Object.keys(response).length === 0) {
      console.log('no local Data stored - trying to build');
      var storageData = {
        'configuration': {
          'maxResults': 50
        },
        'contextOptions': {},
        'tabConnections': {}
      };
      chrome.storage.local.set(storageData, function (response) {
        console.log('storageData was initialized', response);
      });
    } else {
      console.log('local Data found :-)');
    }
  });
}

/**
 * @name setupTabMenu
 * @description Creates an entry into the ContextMenu and listens to ClickEvents
 */
//var setupTabMenu = function() {
//
//  chrome.contextMenus.create({
//    title: 'WebOrganiser',
//    id:'selectFromContextMenu',
//    contexts: ['all']
//  }, function() {
//    var error = chrome.runtime.lastError;
//    if(error) {
//      console.log(error);
//    }
//    else {
//      console.log('Context menu created');
//    }
//  });
//
//  chrome.contextMenus.onClicked.addListener(function(tab) {
//    console.log(tab);
//  });
//
//};

/**
 * @name _init
 * @description initializes all the different background-functions
 * @private
 */
function _init() {

  chrome.runtime.onInstalled.addListener(function (details) {
    console.log('WebOrganizer installed / updated');
    console.log('previousVersion', details.previousVersion);
    setupStorage();
  });

  setBadgeText('bg');
  listenToTabEvents();
}

_init();

//# sourceMappingURL=background.js.map
//# sourceMappingURL=background.js.map
