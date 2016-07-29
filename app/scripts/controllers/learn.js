'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:LearnCtrl
 * @description
 * # LearnCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('LearnCtrl', function($scope, $routeParams, $location, $route, faqsApi, $translate, $log, commonModals, changeLogsApi) {

        switch ($routeParams.section) {
            case 'tutorial':
            case 'tuto':
            case 'Tutorial':
            case 'Tuto':
                $scope.currentTab = 1;
                break;
            case 'forum':
            case 'Forum':
                $scope.currentTab = 2;
                break;
            case 'updates':
            case 'Updates':
                $scope.currentTab = 3;
                break;
            case 'faq':
            case 'Faq':
            /* falls through */
            default:
                $scope.currentTab = 0;
                $scope.faqAnswer = 0;
        }

        $scope.setTab = function(tab) {
            if ($scope.currentTab !== tab) {
                var section;
                switch (tab) {
                    case 0:
                        section = 'faq';
                        break;
                    case 1:
                        section = 'tutorial';
                        break;
                    case 2:
                        section = 'forum';
                        break;
                    case 3:
                        section = 'updates';
                        break;
                }
                $route.current.pathParams.section = section;
                $location.url('/help/' + section);
                $scope.currentTab = tab;
            } else if (tab === 2) {
                $location.url('/help/forum');
            }
        };

        $scope.faqHandler = function(id) {
            if (id === $scope.selectedFaq) {
                $scope.selectedFaq = null;
            } else {
                $scope.selectedFaq = id;
            }
        };

        $scope.setChangeLogItem = function(index) {
            $log.debug(index);
            $scope.currentItem.changeLog = index;
        };

        $scope.currentItem = {};
        $scope.currentItem.changeLog = 0;
        $scope.$translate = $translate;
        $scope.commonModals = commonModals;
        $scope.faqsApi = faqsApi;
        $scope.changeLogsApi = changeLogsApi;
        $scope.selectedFaq = 0;

        $scope.diwoURL = 'http://diwo.bq.com/';

        $scope.$watch('common.user.language', function(newValue, oldValue) {
            if (newValue && newValue !== oldValue) {
                $scope.diwoURL = 'http://diwo.bq.com/';
            }
        });

    });
