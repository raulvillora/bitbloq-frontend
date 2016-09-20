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
    .controller('PlotterCtrl', function($element, web2boardV2, web2board, $timeout, $scope, $translate, common, chromeAppApi, utils, hardwareConstants, $rootScope, _) {

        var serialHub = web2boardV2.api.SerialMonitorHub,
            textArea = $element.find('#serialData'),
            textAreaMaxLength = 20000,
            dataParser = {
                buf: '',
                separator: '\r\n',
                retrieve_messages: function(data) {
                    data = this.buf + data;
                    var split_data = data.split(this.separator);
                    this.buf = split_data.pop();
                    return split_data;
                }
            },
            plotterLength = 500,
            receivedDataCount = 0;

        //its setted when the windows its open
        //$scope.board

        /*Private functions*/
        function scrollTextAreaToBottom() {
            $timeout(function() {
                textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
            }, 0);
        }

        /*Set up web2board api*/
        //when web2board tries to call a client function but it is not defined
        web2boardV2.api.onClientFunctionNotFound = function(hub, func) {
            console.error(hub, func);
        };

        serialHub.client.received = function(port, data) {
            if (port === $scope.port && !$scope.pause && angular.isString(data)) {
                var messages = dataParser.retrieve_messages(data);
                messages.forEach(function(message) {
                    var number = parseFloat(message);
                    if (!$scope.pause && !isNaN(number)) {
                        $scope.data[0].values.push({
                            x: receivedDataCount++,
                            y: number
                        });
                        if ($scope.data[0].values.length > plotterLength) {
                            $scope.data[0].values.shift();
                        }
                    }
                });
                $scope.$apply();
            }
        };

        serialHub.client.written = function(message) {
            $scope.serial.dataReceived += message;
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
        $scope.portNames = [];
        $scope.ports = [];

        $scope.selectedPort = null;
        $scope.pause = false;
        $scope.pauseText = $translate.instant('serial-pause');

        $scope.data = [{
            values: [],
            color: '#6a8d2f'
        }];

        $scope.chartOptions = {
            chart: {
                type: 'lineChart',
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 55
                },
                duration: 0,
                x: function(d) {
                    return d.x;
                },
                y: function(d) {
                    return d.y;
                },
                useInteractiveGuideline: true,
                yAxis: {
                    tickFormat: function(d) {
                        return d3.format('.02f')(d);
                    }
                }
            },
            title: {
                enable: true,
                text: $translate.instant('plotter')
            }
        };

        /*Public functions*/
        $scope.send = function() {
            if (common.useChromeExtension()) {
                chromeAppApi.sendSerialData($scope.serial.input);
            } else {
                serialHub.server.write($scope.port, $scope.serial.input);
            }
            $scope.serial.input = '';
        };

        $scope.onKeyPressedInInput = function(event) {
            if (event.which === 13) {
                $scope.send();
            }
        };

        $scope.onBaudrateChanged = function(baudrate) {
            $scope.serial.baudrate = baudrate;
            if (common.useChromeExtension()) {
                chromeAppApi.changeBaudrate(baudrate);
            } else {
                serialHub.server.changeBaudrate($scope.port, baudrate);
            }
        };

        $scope.onPause = function() {
          $scope.pause = !$scope.pause;
          $scope.pauseText = $scope.pause ? $translate.instant('plotter-play') : $translate.instant('plotter-pause');
        };

        $scope.onClear = function() {
            receivedDataCount = 0;
            $scope.data[0].values = [];
        };

        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        }


        $scope.getPorts = function() {
            chromeAppApi.getPorts().then(function(response) {
                console.log('ports SerialMonitorCtrl', response);
                $scope.ports = filterPortsByOS(response.ports);
                utils.getPortsPrettyNames($scope.ports, hardwareConstants.boards);
                $scope.portNames = [];

                for (var i = 0; i < $scope.ports.length; i++) {
                    $scope.portNames.push($scope.ports[i].portName);
                }

                var portWithUserSelectedBoard = utils.getPortByBoard($scope.ports, $scope.board);
                if (portWithUserSelectedBoard) {
                    $scope.setPort(portWithUserSelectedBoard.portName);
                }

            }).catch(function(error) {
                console.log('error SerialMonitorCtrl', error);
            });
        };

        $scope.setPort = function(portName) {
            var port = _.find($scope.ports, {
                portName: portName
            });

            $scope.selectedPort = port;

            chromeAppApi.getSerialData($scope.selectedPort);
        };

        function filterPortsByOS(ports) {
            var result = [];
            if (common.os === 'Mac') {
                for (var i = 0; i < ports.length; i++) {
                    if (ports[i].comName.indexOf('/dev/cu') !== -1) {
                        result.push(ports[i]);
                    }
                }
            } else {
                result = ports;
            }
            return result;
        }

        /*Init functions*/

        if (common.useChromeExtension()) {
            console.log($scope.board);
            $scope.showPorts = true;
            $scope.getPorts();
        } else {
            serialHub.server.subscribeToPort($scope.port);

            serialHub.server.startConnection($scope.port, $scope.serial.baudrate)
                .catch(function(error) {
                    if (error.error.indexOf('already in use') > -1) {
                        $scope.onBaudrateChanged($scope.serial.baudrate);
                    } else {
                        console.error(error);
                    }
                });

            $scope.setOnUploadFinished(function() {
                $scope.onBaudrateChanged($scope.serial.baudrate);
            });
        }

        $rootScope.$on('serial', function(event, msg) {
            if (!$scope.pause && angular.isString(msg)) {
                $scope.serial.dataReceived += msg;
                var dataLen = $scope.serial.dataReceived.length;
                if (dataLen > textAreaMaxLength) {
                    $scope.serial.dataReceived = $scope.serial.dataReceived.slice(dataLen - textAreaMaxLength);
                }
                scrollTextAreaToBottom();
            }
            //    console.log('msg arrived: ', msg);
        });
        $scope.$on('$destroy', function() {
            if (common.useChromeExtension()) {
                chromeAppApi.stopSerialCommunication();
                web2board.setInProcess(false);
            } else {
                serialHub.server.unsubscribeFromPort($scope.port)
                    .then(function() {
                        return serialHub.server.closeUnusedConnections();
                    });
            }

        });

        // todo: create a serialHandler service to remove duplicated code
        /*    var serialHub = web2boardV2.api.SerialMonitorHub;
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

            */

    });
