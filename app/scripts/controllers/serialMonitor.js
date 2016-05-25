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
    .controller('SerialMonitorCtrl', function ($scope, _, web2boardV2, $translate, $timeout, $element) {
        /*Private vars*/
        var serialHub = web2boardV2.api.SerialMonitorHub,
            textArea = $element.find('#serialData'),
            textAreaMaxLength = 20000;


        /*Private functions*/
        function scrollTextAreaToBottom() {
            $timeout(function () {
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
            }, 0);
        }

        /*Set up web2board api*/
        //when web2board tries to call a client function but it is not defined
        web2boardV2.api.onClientFunctionNotFound = function (hub, func) {
            console.error(hub, func);
        };

        serialHub.client.received = function (port, data) {
            if (port === $scope.port && !$scope.pause && angular.isString(data)) {
                $scope.serial.dataReceived += data;
                var dataLen = $scope.serial.dataReceived.length;
                if (dataLen > textAreaMaxLength) {
                    $scope.serial.dataReceived = $scope.serial.dataReceived.slice(dataLen - textAreaMaxLength);
                }
                scrollTextAreaToBottom();
            }
        };

        // function called when someone writes in serial (including ourselves)
        // serialHub.client.written = function (message) {
        //     $scope.serial.dataReceived += message;
        // };

        /*public vars*/
        $scope.baudrateOptions = [300, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200];
        $scope.serial = {
            dataReceived: '',
            input: '',
            baudrate: 9600
        };
        $scope.pause = false;
        $scope.pauseText = $translate.instant('serial-pause');

        /*Public functions*/
        $scope.send = function () {
            serialHub.server.write($scope.port, $scope.serial.input);
            $scope.serial.input = '';
        };

        $scope.onKeyPressedInInput = function (event) {
            if (event.which === 13) {
                $scope.send();
            }
        };

        $scope.onBaudrateChanged = function (baudrate) {
            $scope.serial.baudrate = baudrate;
            serialHub.server.changeBaudrate($scope.port, baudrate);
        };

        $scope.onPause = function () {
            $scope.pause = !$scope.pause;
            if ($scope.pause) {
                $scope.serial.dataReceived += '\n\nSerial Monitor paused\n\n';
                scrollTextAreaToBottom();
            }
            $scope.pauseText = $scope.pause ? $translate.instant('serial-play') : $translate.instant('serial-pause');
        };

        $scope.onClear = function () {
            $scope.serial.dataReceived = '';
        };

        /*Init functions*/
        serialHub.server.subscribeToPort($scope.port);

        serialHub.server.startConnection($scope.port, 9600)
            .catch(function (error) {
                if (error.error.indexOf('already in use') > -1) {
                    $scope.onBaudrateChanged(9600);
                }
            });

        $scope.$on('$destroy', function () {
            serialHub.server.unsubscribeFromPort($scope.port)
                .then(function () {
                    return serialHub.server.closeUnusedConnections();
                });
        });
    });
