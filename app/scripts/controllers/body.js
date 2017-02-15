'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:BodyCtrl
 * @description
 * # BodyCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('BodyCtrl', function($scope, common, _, envData) {
        $scope.common = common;
        $scope.envData = envData;
        $scope.isHeader = function() {
            var notInSections = [
                '',
                'bloqsproject',
                'codeproject',
                'exercise',
                'task',
                'features',
                'downloads',
                'bitbloq-help',
                'aboutus',
                'login',
                'resetpassword',
                'recovery',
                'unsupported',
                'register',
                'serialMonitor',
                'chartMonitor',
                'offline',
                'howitworks'
            ];

            return (!common.user && (common.section === 'bloqsproject' || common.section === 'codeproject')) || !_.includes(notInSections, common.section);
        };
    });
