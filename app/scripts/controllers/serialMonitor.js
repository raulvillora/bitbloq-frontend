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
    .controller('SerialMonitorCtrl', function($scope, _, web2board2) {
        var serialHub = web2board2.api.SerialMonitorHub;
        $scope.serial = {
            dataReceived: '',
            input: ''
        };

        serialHub.client.received = function(port, data) {
            console.log(data);
            $scope.serial.dataReceived += data;
        };

        $scope.baudrateOptions = [9600, 115200];
        $scope.loginSubmit = function() {
            web2board2.openCommunication(function() {
                serialHub.server.subscribeToHub().done(function() {
                    web2board2.api.UtilsAPIHub.server.setId('SerialMonitor' + Math.random());
                });
                serialHub.server.getAvailablePorts().done(function(ports) {
                    serialHub.server.startConnection(ports[0], 9600);
                });
            });
        };

    });