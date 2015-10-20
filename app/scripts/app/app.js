"use strict"

// Declare app level module which depends on filters, and services
angular
  .module('newTab', [
  'ngRoute',
  ])
  .config(function(configurationProvider) {
    configurationProvider.setDayRange(0, 30);
    configurationProvider.minPages(1);
    configurationProvider.maxPages(1);
    configurationProvider.maxResults(20);
    configurationProvider.maxVisits(5);
  });
