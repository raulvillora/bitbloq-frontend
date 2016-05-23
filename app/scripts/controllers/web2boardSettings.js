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
    .controller('Web2boardSettingsCtrl', function ($scope, _, web2boardV2) {
        var configHub = web2boardV2.api.ConfigHub,
            versionHub = web2boardV2.api.VersionsHandlerHub;
        $scope.settings = {
            libraries_path: '',
            proxy: '',
            check_online_updates: false
        };
        $scope.version = {
            web2board: '',
            bitbloqLibs: ''
        };
        $scope.proxyTestIcon = null;
        $scope.proxyTestClass = null;
        $scope.libsPathIcon = null;
        $scope.libsPathClass = null;

        web2boardV2.api.callbacks.onClientFunctionNotFound = function (hub, func) {
            console.error(hub, func);
        };

        configHub.server.getConfig().then(function (config) {
            $scope.settings = config;
            return versionHub.server.getLibVersion();
        }).then(function (version) {
            $scope.version.bitbloqLibs = version;
            return versionHub.server.getVersion();
        }).then(function (version) {
            $scope.version.web2board = version;
        });

        $scope.onLibrariesPathChanged = function () {
            $scope.libsPathIcon = '#loading';
            $scope.libsPathClass = 'w2b__settings_w2b__settings_loading';
            configHub.server.isPossibleLibrariesPath($scope.settings.libraries_path)
                .then(function (isPossible) {
                    if(isPossible) {
                        $scope.libsPathIcon = '#ok';
                        $scope.libsPathClass = 'w2b__settings_ok';
                    }else {
                        $scope.libsPathIcon = '#error';
                        $scope.libsPathClass = 'w2b__settings_error';
                    }
                });
        };

        $scope.testProxy = function () {
            $scope.proxyTestIcon = '#loading';
            $scope.proxyTestClass = 'w2b__settings_w2b__settings_loading';
            configHub.server.testProxy($scope.settings.proxy)
                .then(function () {
                    $scope.proxyTestIcon = '#ok';
                    $scope.proxyTestClass = 'w2b__settings_ok';
                })
                .catch(function () {
                    $scope.proxyTestIcon = '#error';
                    $scope.proxyTestClass = 'w2b__settings_error';
                });
        };

        $scope.confirmAction = function () {
            configHub.server.setValues($scope.settings)
                .then(function () {
                    console.log('Successfully saved settings');
                    $scope.closeThisDialog();
                }, function (error) {
                    console.error('unable to save settings due to: ', error);
                });
        };

    });
