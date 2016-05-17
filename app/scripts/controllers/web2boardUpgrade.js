/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('web2boardUpgradeCtrl', function ($scope, _, web2board2) {
        /*Private vars*/
        var versionHub = web2board2.api.VersionsHandlerHub;
        $scope.baudrateOptions = [300, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200];

        $scope.progress = {
            current: 0,
            total: 100,
            percentage: 0
        };

        web2board2.api.onClientFunctionNotFound = function () {
            console.log(arguments);
        };

        versionHub.client.downloadProgress = function (current, total, percentage) {
            $scope.progress.current = current;
            $scope.progress.total = total;
            $scope.progress.percentage = parseInt(percentage);
        };
        
        versionHub.client.downloadEnded = function (success) {
            if(success) {
                console.log('Successfully downloaded');
                $scope.progress.percentage = 100;
            }else {
                console.error('error updating web2board');
            }
        };

        $scope.onCancel = function () {
            console.log('pause');
        };

        $scope.onClear = function () {
            console.log('onClear');
        };
        
        versionHub.server.getVersion()
            .then(function (version) {
                $scope.version = version;
            });
        console.log($scope);


        versionHub.server.subscribeToHub()
            .then(function () {
                versionHub.server.setWeb2boardVersion('2.0.0').then(function () {
                    
                });
            });
    });