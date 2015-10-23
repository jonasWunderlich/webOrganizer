'use strict';

/**
 * @ngdoc provider
 * @name newTab.Configuration
 * @description
 * # Configuration
 * provider for getting the Configuration
 */
angular.module('newTab').provider('configuration', function () {

  this.setDayRange = function (day, range) {
    var _date = new Date().getTime();
    var _milSecPerDay = 1000 * 60 * 60 * 24;
    this.lastDay = day;
    this.dayRange = range;
    this.endTime = _date - _milSecPerDay * day;
    this.startTime = _date - _milSecPerDay * (range + day);
  };
  this.minPages = function (v) {
    this.minPages = v;
  };
  this.maxPages = function (v) {
    this.maxPages = v;
  };
  this.maxResults = function (v) {
    this.maxResults = v;
  };
  this.maxVisits = function (v) {
    this.maxVisits = v;
  };

  this.$get = function () {
    var self = this;
    return {
      getHistoryConfiguration: function getHistoryConfiguration() {
        return {
          'text': '',
          'startTime': self.startTime,
          'endTime': self.endTime,
          'maxResults': self.maxResults
        };
      },
      getMaxVisits: function getMaxVisits() {
        return self.maxVisits;
      }
    };
  };
});
//# sourceMappingURL=configuration.js.map
