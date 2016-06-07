'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:BodyCtrl
 * @description
 * # BodyCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('BodyCtrl', function($scope, common, _) {
        $scope.common = common;
        $scope.isHeader = function() {
            var notInSections = [
                '',
                'bloqsproject',
                'codeproject',
                'features',
                'downloads',
                'bitbloq-help',
                'aboutus',
                'login',
                'recovery',
                'unsupported',
                'register',
                'serialMonitor',
                'chartMonitor',
                'offline',
                'howitworks'
            ];

            return (!common.user && (common.section === 'bloqsproject' || common.section === 'codeproject')) || !_.contains(notInSections, common.section);
        };
    });