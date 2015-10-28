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

  tabConnections = chrome.storage.local.get('tabConnections', function(result) {
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
      return chrome.tabs.get(tab.openerTabId, function(openerTab) {
        if (openerTab.url !== 'chrome://newtab/' && tab.url !== 'chrome://newtab/') {

          // Get the Visits of the new Tab
          return chrome.history.getVisits({url: tab.url}, function(visits) {
            if (visits.length > 0) {
              var lastVisitId = visits[visits.length - 1].visitId;

              // Get the Visits of the openerTab
              return chrome.history.getVisits({url: openerTab.url}, function(openerVisits) {
                // Write the Connection between the Tabs in the Storage
                var openerLastVisitId = openerVisits[openerVisits.length - 1].visitId;
                tabConnections[lastVisitId] = openerLastVisitId;
                console.log('Writing Connection: VisitId '+lastVisitId+' was opened by '+openerLastVisitId);
                return chrome.storage.local.set({'tabConnections': tabConnections});
              });
            }
          });
        }
      });
    }
  }



  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Get the already existing TabConnections from Storage
    if (changeInfo.status === 'complete') {
      return setTabConnection(tab);
    }
  });

  chrome.webNavigation.onCommitted.addListener(function(details) {
    if (details.transitionQualifiers) {
      if (details.transitionQualifiers === 'forward_back') {
        lastPage = details.url;
        return lastPage;
      }
    }
  });

}


function setupStorage() {
  chrome.storage.local.get(function(response) {

    if(Object.keys(response).length === 0) {
      console.log('no local Data stored - trying to build');
      var storageData = {
        'configuration' : {
          'maxResults': 50
        },
        'contextOptions': {},
        'tabConnections': {}
      };
      chrome.storage.local.set(storageData, function(response) {
        console.log('storageData was initialized', response);
      });
    } else {
      console.log('local Data found :-)');
    }
  });
}




//
///**
// * @ngdoc method
// * @name getStoredContexts
// * @methodOf newTab.StorageService
// * @description Checks if Context-Configuration already exists in the Storage - If not creates it
// * @returns {promise}
// */
//var constructContextOptions = function() {
//  chrome.storage.local.get('newContextOptions',function(newContextOptions){
//    console.log('Looking for newContentOptions', newContextOptions);
//    if(Object.keys(newContextOptions).length === 0) {
//      console.log('newContextOptions not found');
//      chrome.bookmarks.getTree(function(bookmarkTree) {
//        writeNewContextOptions(bookmarks);
//      });
//    } else {
//      console.log('newContextOptions found');
//      //TODO: update newContextOptions
//    }
//    return newContextOptions;
//  });
//};
//
//
///**
// * @ngdoc method
// * @name writeContextOptions
// * @methodOf newTab.StorageService
// * @description
// * @param bookmarks
// */
//var writeNewContextOptions = function(bookmarks) {
//  //TODO: Maybe this can be put into the getStoredContext-method later
//  var _contextOptions = setupContextOptions(bookmarks);
//  //TODO: This needs to be put as a function to the ChromeApi that returns a promise
//  chrome.storage.local.set({'contextOptions': _contextOptions}, function() {});
//};
//
///**
// * @ngdoc method
// * @name setupContextOptions
// * @methodOf newTab.StorageService
// * @description Recursive Function for writing Context Configuration Data in the Storage
// * @param data
// * @returns {{}}
// */
//var setupContextOptions = function(data) {
//  var bookmarkFolder = _.filter(data, 'children');
//  var result = {};
//  _.each(bookmarkFolder, function(item) {
//    var entry = _.omit(item, 'id', 'dateGroupModified', 'dateAdded', 'children');
//    entry.color = randomColor();
//    result[item.id] = entry;
//    // TODO: Maybe its better to filter empty objects before the recursion
//    _.merge(result, setupContextOptions(item.children))
//  });
//  return result;
//};
//





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