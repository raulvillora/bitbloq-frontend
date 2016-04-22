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
    .controller('Web2boardSettings', function ($scope, _, web2board2) {
        var configHub = web2board2.api.ConfigHub;
        $scope.settings = {
            webSocketIP: '',
            webSocketPort: 0,
            librariesPath: '',
            proxy: ''
        };

        web2board2.api.callbacks.onClientFunctionNotFound = function (hub, func) {
            console.error(hub, func);
        };

        web2board2.api.connect().done(function () {
            configHub.server.getConfig().done(function(config){
                $scope.settings = config;
            });
        });
        
        $scope.onLibrariesPathChanged = function(){
            configHub.server.isLibrariesPathPossible($scope.settings.librariesPath)
                .done(function (isPossible){
                console.log(isPossible ? 'GOOD': 'BAD');
            });
        };

        $scope.confirmAction = function () {
            configHub.server.setValues($scope.settings).done(function () {
                console.log('Successfully saved settings');
                $scope.closeDialog();
            }, function (error) {
                console.error('unable to save settings due to: ', error);
            });
        };


    });