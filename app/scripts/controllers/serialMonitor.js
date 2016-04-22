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
    .controller('SerialMonitorCtrl', function ($scope, _, web2board2) {
        var serialHub = web2board2.api.SerialMonitorHub;
        $scope.baudrateOptions = [9600, 115200];
        $scope.serial = {
            dataReceived: '',
            input: '',
            port: '',
            baudrate: 9600
        };

        web2board2.api.callbacks.onClientFunctionNotFound = function (hub, func) {
            console.error(hub, func);
        };

        serialHub.client.received = function (port, data) {
            console.log(data);
            $scope.serial.dataReceived += data;
        };

        serialHub.client.written = function (message) {
            $scope.serial.dataReceived += message;
        };

        $scope.send = function () {
            serialHub.server.write($scope.serial.port, $scope.serial.input);
        };

        $scope.onBaudrateChanged = function (baudrate) {
            $scope.serial.baudrate = baudrate;
            serialHub.server.changeBaudrate($scope.serial.port, baudrate);
            $scope.loginSubmit = function () {
                web2board2.openCommunication(function () {
                    serialHub.server.subscribeToHub().done(function () {
                        web2board2.api.UtilsAPIHub.server.setId('SerialMonitor' + Math.random());
                    });
                    serialHub.server.getAvailablePorts().done(function (ports) {
                        serialHub.server.startConnection(ports[0], 9600);
                    });
                });
            };
        }
    });