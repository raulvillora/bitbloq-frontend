'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:HelpCtrl
 * @description
 * # HelpCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('HelpCtrl', function($scope, $routeParams, $location, $route, $translate, $log, commonModals) {

        $scope.currentItem = {};
        $scope.$translate = $translate;
        $scope.commonModals = commonModals;
        $scope.currentTab = 2;

        $scope.diwoURL = 'http://diwo.bq.com/';

        $scope.$watch('common.user.language', function(newValue, oldValue) {
            if (newValue && newValue !== oldValue) {
                $scope.diwoURL = 'http://diwo.bq.com/';
            }
        });

    });
