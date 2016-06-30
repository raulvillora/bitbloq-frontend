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
    .controller('PlotterCtrl', function ($scope, _, web2boardV2) {
        // todo: create a serialHandler service to remove duplicated code
        var serialHub = web2boardV2.api.SerialMonitorHub;
        $scope.baudrateOptions = [9600, 115200];
        $scope.serial = {
            dataReceived: '',
            input: '',
            port: '',
            baudrate: 9600
        };

        $scope.labels = [];
        $scope.series = ['Series A'];
        $scope.data = [
            []
        ];

        $scope.chartOptions = {
            animation: false,
            pointDot: true
        };

        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };

        web2boardV2.api.onClientFunctionNotFound = function (hub, func) {
            console.error(hub, func);
        };

        web2boardV2.api.connect().done(function () {
            serialHub.server.subscribeToHub().done(function () {
                console.log('subscribed');
                web2boardV2.api.UtilsAPIHub.server.setId('ChartMonitor' + Math.random());
            });
            serialHub.server.getAvailablePorts().done(function (ports) {
                console.log('ports', ports);
                $scope.serial.port = ports[0];
                serialHub.server.startConnection(ports[0], $scope.serial.baudrate);
            });
        });

        serialHub.client.received = function (port, data) {
            var number = parseInt(data);
            if (!isNaN(number)) {
                $scope.data[0].push(number);
                $scope.labels.push($scope.labels.length);
                if ($scope.labels.length > 20) {
                    $scope.chartOptions.pointDot = false;
                }
            }

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
        };

    });
