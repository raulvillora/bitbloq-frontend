'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:CookiesCtrl
 * @description
 * # CookiesCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('CookiesCtrl', function($scope, $translate) {
        $scope.translate = $translate;
    });
