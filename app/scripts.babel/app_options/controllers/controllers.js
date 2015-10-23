angular.module('app_options')
  .controller('MainController', ['$scope', function($scope) {
      $scope.welcomeMsg = "This is the Options View";

      $scope.contribute = function() {
        chrome.tabs.create({
          url: 'https://github.com/flrent/chrome-extension-angular-base'
        })
      }
  }])
;
