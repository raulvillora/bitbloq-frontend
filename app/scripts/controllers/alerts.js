'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:AlertsCtrl
 * @description
 * # AlertsCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('AlertsCtrl', function($scope, alertsService) {
        $scope.alerts = alertsService.getInstance();
        $scope.generateSvgUrl = function(id) {
            return 'images/sprite.svg#' + id;
        };
    });