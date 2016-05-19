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
    .controller('Web2boardSettings', function ($scope, _, web2boardV2) {
        var configHub = web2boardV2.api.ConfigHub;
        $scope.settings = {
            web_socket_ip: '',
            web_socket_port: 0,
            libraries_path: '',
            proxy: ''
        };

        web2boardV2.api.callbacks.onClientFunctionNotFound = function (hub, func) {
            console.error(hub, func);
        };

        configHub.server.getConfig().then(function (config) {
            $scope.settings = config;
        });

        $scope.onLibrariesPathChanged = function () {
            configHub.server.isPossibleLibrariesPath($scope.settings.libraries_path)
                .then(function (isPossible) {
                    console.log(isPossible ? 'GOOD' : 'BAD');
                });
        };

        $scope.confirmAction = function () {
            configHub.server.setValues($scope.settings)
                .then(function () {
                    console.log('Successfully saved settings');
                    $scope.closeDialog();
                }, function (error) {
                    console.error('unable to save settings due to: ', error);
                });
        };

    });
