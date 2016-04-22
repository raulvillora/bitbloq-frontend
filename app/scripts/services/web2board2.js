                    
'use strict';
/**
 * @ngdoc service
 * @name bitbloqApp.web2board
 * @description
 * # web2board
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .factory('web2board2', function($rootScope, $websocket, $log, $q, ngDialog, _, $timeout, common, envData,
                                    alertsService, WSHubsAPI, OpenWindow) {

        /** Variables */

        var web2board = this,
            api,
            inProgress = false,
            TIME_FOR_WEB2BOARD_TO_START = 700, //ms
            TIMES_TRY_TO_START_W2B = 20,
            w2bToast = null;

        web2board.config = {
            wsHost: 'localhost',
            wsPort: 9876,
            serialPort: ''
        };

        function isWeb2boardUpToDate(version) {
            return parseInt(version.replace(/\./g, ''), 10) >= parseInt(common.properties.web2boardVersion.replace(/\./g, ''), 10);
        }

        function isWSNotConnected(wsClient) {
            return !wsClient || (wsClient.readyState !== WebSocket.CONNECTING && wsClient.readyState !== WebSocket.OPEN);
        }

        function removeInProgressFlag() {
            $rootScope.$apply(function() {
                inProgress = false;
            });
        }

        function showUpdateModal() {
            var parent = $rootScope,
                modalOptions = parent.$new();
            _.extend(modalOptions, {
                contentTemplate: '/views/modals/download-web2board.html',
                modalTitle: 'modal-update-web2board-title',
                modalText: 'modal-download-web2board-text'
            });
            modalOptions.envData = envData;
            ngDialog.closeAll();
            ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--download-web2board',
                scope: modalOptions,
                showClose: false
            });
        }

        function startWeb2board() {
            console.log('starting Web2board...');
            var tempA = document.createElement('a');
            tempA.setAttribute('href', 'web2board://');
            document.body.appendChild(tempA);
            tempA.click();
            document.body.removeChild(tempA);
        }

        function onOpenConnectionTrigger(callback) {
            api.VersionsHandlerHub.server.getVersion().done(function(version) {
                if (!isWeb2boardUpToDate(version)) {
                    removeInProgressFlag();
                    showUpdateModal();
                } else {
                    // var libVersion = common.properties.bitbloqLibsVersion || '0.0.1';
                    var libVersion = '0.1.1';
                    api.VersionsHandlerHub.server.setLibVersion(libVersion).done(function() {
                        callback();
                    }, function(error) {
                        $log.error('Unable to update libraries due to: ' + error);
                    });
                }
            }, function(error) {
                $log.error('unable to get version due to : ' + error);
            });
        }

        function openCommunication(callback, showUpdateModalFlag, tryCount) {
            tryCount = tryCount || 0;
            tryCount++;
            if (tryCount === 1) {
                w2bToast = alertsService.add('web2board_toast_startApp', 'web2board', 'loading');
            }
            showUpdateModalFlag = showUpdateModalFlag === true && tryCount >= TIMES_TRY_TO_START_W2B;
            callback = callback || angular.noop;
            if (isWSNotConnected(api.wsClient)) {
                api.connect().done(
                    function() { //on success
                        api.wsClient.couldSuccessfullyConnect = true;
                        alertsService.close(w2bToast);
                        api.UtilsAPIHub.server.setId('Bitbloq').done(function() {
                            onOpenConnectionTrigger(callback);
                        });
                    },
                    function() { //on error
                        if (showUpdateModalFlag) {
                            inProgress = false;
                            alertsService.close(w2bToast);
                            showUpdateModal();
                        } else {
                            if (tryCount === 1) {
                                // we only need to start web2board once
                                startWeb2board();
                            }
                            $timeout(function() {
                                openCommunication(callback, true, tryCount);
                            }, TIME_FOR_WEB2BOARD_TO_START);
                        }
                    }
                );
            } else {
                callback();
            }
        }

        function handleUploadError(error) {
            if (error.title === 'COMPILE_ERROR') {
                alertsService.add('alert-web2board-compile-error', 'web2board', 'warning', undefined, error.stdErr);
            } else if (error.title === 'BOARD_NOT_READY') {
                alertsService.add('alert-web2board-no-port-found', 'web2board', 'warning');
            } else {
                var errorTag = 'alert-web2board-upload-error';
                alertsService.add(errorTag, 'web2board', 'warning', undefined, error);
            }
        }

        function webSocketWrapper(url) {
            var ws = $websocket(url);
            ws.onMessage(function(ev) {
                ws.onmessage(ev);
            });
            ws.onOpen(function(ev) {
                ws.onopen(ev);
            });
            ws.onClose(function(ev) {
                ws.onclose(ev);
            });
            return ws;
        }

        function openSerialWindow(url, title, board) {
            if (!inProgress) {
                if (!board) {
                    alertsService.add('alert-web2board-boardNotReady', 'web2board', 'warning');
                    return;
                }

                var windowArguments = {
                    url: url,
                    title: title
                };
                openCommunication(function () {
                    OpenWindow.open(windowArguments, function () {
                        window.setTimeout(function () {
                            api.SerialMonitorHub.server.closeAllConnections();
                            api.SerialMonitorHub.server.unsubscribeFromHub();
                        }, 100);
                    });
                });
            }
        }

        api = WSHubsAPI.construct('ws://' + web2board.config.wsHost + ':' + web2board.config.wsPort, 45, webSocketWrapper);

        api.defaultErrorHandler = function(error) {
            $log.error('Error receiving message: ' + error);
        };

        api.callbacks.onClose = function(error) {
            $log.error('web2board disconnected with error: ' + error.reason);
            api.clearTriggers();
            inProgress = false;
            if (api.wsClient.couldSuccessfullyConnect) {
                alertsService.add('web2board_toast_closedUnexpectedly', 'web2board', 'warning');
            }
        };

        api.callbacks.onMessageError = function(error) {
            $log.error('Error receiving message: ' + error);
            api.wsClient.close();
        };

        api.CodeHub.client.isCompiling = function() {
            alertsService.add('alert-web2board-compiling', 'web2board', 'loading', undefined);
        };

        api.CodeHub.client.isUploading = function(port) {
            alertsService.add('alert-web2board-uploading', 'web2board', 'loading', undefined, port);
        };

        api.CodeHub.client.isSettingPort = function(port) {
            $log.debug('is setting port in: ' + port);
            web2board.serialPort = port;
        };

        web2board.verify = function(code) {
            //It is not mandatory to have a board connected to verify the code
            if (!inProgress) {
                inProgress = true;
                openCommunication(function() {
                    api.CodeHub.server.compile(code).done(function() {
                        alertsService.add('alert-web2board-compile-verified', 'web2board', 'ok', 5000);
                    }, function(error) {
                        alertsService.add('alert-web2board-compile-error', 'web2board', 'warning', undefined, error);
                    }).finally(removeInProgressFlag);
                });
            }
        };

        web2board.upload = function(board, code) {
            if (!inProgress) {
                if (!code || !board) {
                    alertsService.add('alert-web2board-boardNotReady', 'web2board', 'warning');
                    return;
                }
                inProgress = true;
                openCommunication(function() {
                    alertsService.add('alert-web2board-settingBoard', 'web2board', 'loading');
                    api.CodeHub.server.upload(code, board.mcu).done(function() {
                        alertsService.add('alert-web2board-code-uploaded', 'web2board', 'ok', 5000);
                    }, handleUploadError).finally(removeInProgressFlag);
                });
            }
        };

        web2board.serialMonitor = function(board) {
            openSerialWindow('http://localhost:9000/#/serialMonitor', 'Serial monitor', board);
        };
                inProgress = true;

        web2board.chartMonitor = function (board) {
            openSerialWindow('http://localhost:9000/#/chartMonitor', 'Chart monitor', board);
        };

        web2board.showSettings = function () {
            if (!inProgress) {
                openCommunication(function() {
                    OpenWindow.open(windowArguments, function() {
                        window.setTimeout(function() {
                            api.SerialMonitorHub.server.closeAllConnections();
                            api.SerialMonitorHub.server.unsubscribeFromHub();
                        }, 100);
                    });
                    
                    var dialog,
                        parent = $rootScope,
                        modalOptions = parent.$new();
                    _.extend(modalOptions, {
                        contentTemplate: '/views/modals/web2board-settings.html',
                        modalTitle: 'modal-update-web2board-title',
                        modalText: 'modal-download-web2board-text',
                        confirmButton: 'save',
                        rejectButton: 'cancel',
                        modalButtons: true,
                        closeDialog: function () {
                            dialog.close();
                        }
                    });
                    modalOptions.envData = envData;
                    ngDialog.closeAll();
                    dialog = ngDialog.open({
                        template: '/views/modals/modal.html',
                        className: 'modal--container modal--download-web2board',
                        scope: modalOptions,
                        showClose: false,
                        controller: 'Web2boardSettings'
                    });
                });
            }
        };

        web2board.version = function() {
            openCommunication();
        };

        web2board.uploadHex = function(boardMcu, hexText) {
            openCommunication(function() {
                alertsService.add('alert-web2board-settingBoard', 'web2board', 'loading');
                api.CodeHub.server.uploadHex(hexText, boardMcu).done(function(port) {
                    alertsService.add('alert-web2board-code-uploaded', 'web2board', 'ok', 5000, port);
                }, handleUploadError).finally(removeInProgressFlag);
            });
        };

        web2board.showApp = function() {
            openCommunication(function() {
                alertsService.add('web2board_toast_showingApp', 'web2board', 'loading');
                api.WindowHub.server.showApp().done(function() {
                    alertsService.add('web2board_toast_successfullyOpened', 'web2board', 'ok', 3000);
                });
            });
        };

        return {
            verify: web2board.verify,
            upload: web2board.upload,
            serialMonitor: web2board.serialMonitor,
            chartMonitor: web2board.chartMonitor,
            version: web2board.version,
            uploadHex: web2board.uploadHex,
            showWeb2board: web2board.showApp,
            showSettings: web2board.showSettings,
            openSettings: showUpdateModal,
            isInProcess: function() {
                return inProgress;
            },
            setInProcess: function(value) {
                inProgress = value;
            },
            callFunction: function(called) {
                alertsService.closeByTag(called.alertServiceTag);
                web2board[called.name].apply(web2board[called.name], called.args);
            },
            openCommunication: openCommunication,
            api: api
        };

    });
