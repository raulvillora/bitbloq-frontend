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

        switch ($routeParams.section) {
            case 'forum':
            case 'Forum':
            default:
                $scope.currentTab = 2;
                break;
        }

        $scope.setTab = function(tab) {
            if ($scope.currentTab !== tab) {
                var section;
                switch (tab) {
                    case 2:
                        section = 'forum';
                        break;
                }
                $route.current.pathParams.section = section;
                $location.url('/help/' + section);
                $scope.currentTab = tab;
            } else if (tab === 2) {
                $location.url('/help/forum');
            }
        };

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
