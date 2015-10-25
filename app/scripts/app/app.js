'use strict';

// Declare app level module which depends on filters, and services
angular.module('newTab', ['angular.filter', 'ngRoute', 'ui.bootstrap']).config(function (configurationProvider, $compileProvider) {
  configurationProvider.setDayRange(0, 30);
  configurationProvider.minPages(1);
  configurationProvider.maxPages(1);
  configurationProvider.maxResults(100);
  configurationProvider.maxVisits(5);
  //$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome|chrome-extension):|data:image\/)/);
});
//# sourceMappingURL=app.js.map
