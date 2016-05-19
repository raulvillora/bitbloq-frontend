'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.web2board
 * @description
 * # web2board
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .factory('web2board', function ($rootScope, $websocket, $log, $q, ngDialog, _, $timeout, common, envData, web2board2, alertsService) {

        /** Variables */

        var web2board = this,
            ws, modalObj,
            boardReadyPromise = null,
            versionPromise = $q.defer(),
            libVersionPromise = $q.defer(),
            isWeb2board2Flag = null,
            firstFunctionCalled = {name: '', args: [], alertServiceTag: ''},
            inProgress,
            TIME_FOR_WEB2BOARD_TO_START = 700, //ms
            TIMES_TRY_TO_START_W2B = 15;

        web2board.config = {
            wsHost: 'localhost',
            wsPort: 9876,
            serialPort: ''
        };

        function isEvtForNewVersionJson(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }

        function rootWeb2boardToNewVersion() {
            ws.close(true);
            isWeb2board2Flag = true;
            web2board2.callFunction(firstFunctionCalled);
            web2board2.setInProcess(true);

            web2board.verify = web2board2.verify;
            web2board.upload = web2board2.upload;
            web2board.serialMonitor = web2board2.serialMonitor;
            web2board.chartMonitor = web2board2.chartMonitor;
            web2board.version = web2board2.version;
            web2board.showSettings = web2board2.showSettings;
        }

        function showUpdateModal() {
            $rootScope.$emit('web2board:no-web2board');
            var parent = $rootScope,
                modalOptions = parent.$new();
            _.extend(modalOptions, {
                contentTemplate: '/views/modals/downloadWeb2board.html',
                modalTitle: 'modal-download-web2board-title',
                modalText: 'modal-download-web2board-text'
            });
            modalOptions.envData = envData;
            if (!modalObj || !ngDialog.isOpen(modalObj.id)) {
                modalObj = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--download-web2board',
                    scope: modalOptions,
                    showClose: true
                });
            }
        }

        function startWeb2board() {
            console.log('starting Web2board...');
            var tempA = document.createElement('a');
            tempA.setAttribute('href', 'web2board://');
            document.body.appendChild(tempA);
            tempA.click();
            document.body.removeChild(tempA);
        }

        /**
         * [connect ws connecting]
         * @param  {[object]} config [{port:myport,host:myhost}]
         * @return {[boolean]}        [Is connection OK?]
         */
        web2board._connect = function () {

            var dfd = $q.defer();

            if (!ws || ws.readyState !== 1) { // It's already connected

                ws = $websocket('ws://' + web2board.config.wsHost + ':' + web2board.config.wsPort);
                ws.onOpen(function (evt) {
                    if (ws.readyState === 1) {
                        $log.debug('web2board:connected');
                        dfd.resolve(evt);
                    } else {
                        dfd.reject(evt);
                    }
                });

                //Socket events handlers
                ws.onClose(function (evt) {
                    web2board._notify(evt);
                });
                ws.onMessage(function (evt) {
                    if (isWeb2board2Flag === null) {
                        if (isEvtForNewVersionJson(evt.data)) {
                            rootWeb2boardToNewVersion();
                            return;
                        } else {
                            isWeb2board2Flag = false;
                        }
                    }

                    web2board._notify(evt);
                });
                ws.onError(function (evt) {
                    dfd.reject(evt);
                });

            } else {
                $log.debug('web2board is already connected');
                dfd.resolve(true);
            }

            return dfd.promise;
        };

        web2board._send = function (message) {
            $log.debug('web2board:send::', message);
            return ws.send(message);
        };

        web2board._setBoard = function (boardMCU) {
            boardReadyPromise = $q.defer();
            var defaultBoard = boardMCU || 'uno';
            this._send('setBoard ' + defaultBoard);
            return boardReadyPromise.promise;
        };

        web2board._disconnect = function () {
            $log.error('web2board disconnected');
            return ws.close();
        };

        web2board._notify = function (evt) {

            $log.debug('web2board:response::', evt.type);

            /**
             * [
             * msgDecoded[0]:message
             * msgDecoded[1]:value
             * ]
             * @type {Array}
             */
            var msgDecoded = [],
                msgParsed;

            if (evt.type === 'message' && evt.data) {
                $log.debug(evt.data);
                msgDecoded = evt.data.split(/\s->\s/);

                if (msgDecoded.length > 1) {
                    msgParsed = msgDecoded[1];
                    $log.debug('MSG: ', msgParsed);
                }
                switch (msgDecoded[0]) {
                case 'SETTING BOARD':
                    $rootScope.$emit('web2board:settingBoard');
                    break;
                case 'SETTING PORT':
                    var ports = JSON.parse(msgParsed);
                    if (ports.length > 0) {
                        web2board.serialPort = ports[0];
                        $log.debug('web2board', web2board.serialPort);
                    }
                    $rootScope.$emit('web2board:boardReady', msgParsed);
                    break;
                case 'COMPILING':
                    $rootScope.$emit('web2board:compiling');
                    break;
                case 'COMPILED':
                    $log.debug('compiled?:', evt.data.indexOf('KO'));
                    if (evt.data.indexOf('KO') !== -1) {
                        $rootScope.$emit('web2board:compile-error', msgParsed);
                    } else {
                        $rootScope.$emit('web2board:compile-verified', msgParsed);
                    }
                    break;
                case 'UPLOADING':
                    $rootScope.$emit('web2board:uploading', web2board.serialPort);
                    break;
                case 'UPLOADED':
                    if (evt.data.indexOf('KO') !== -1) {
                        $rootScope.$emit('web2board:upload-error', msgParsed);
                    } else {
                        $rootScope.$emit('web2board:code-uploaded', msgParsed);
                    }
                    break;
                case 'NO PORT FOUND':
                    $rootScope.$emit('web2board:no-port-found');
                    break;
                case 'VERSION':
                    $rootScope.$emit('web2board:version', msgParsed);
                    break;
                case 'SERIALMONITOROPENED':
                    $rootScope.$emit('web2board:serial-monitor-opened', msgParsed);
                    break;
                case 'SETTED VERSION':
                    $rootScope.$emit('web2board:bitbloqlibs-setted', msgParsed);
                    break;
                default:
                    throw 'WTF?!? ' + evt.data;
                }

            } else if (evt.type === 'close') {
                $rootScope.$emit('web2board:disconnected');
            } else if (evt.type === 'error') {
                $rootScope.$emit('web2board:disconnected');
            }

            return true;
        };

        web2board._checkVersion = function () {
            web2board._send('version');
            return versionPromise.promise;
        };

        web2board._checkLibVersion = function () {
            var version = common.properties.bitbloqLibsVersion || '0.0.1';
            web2board._send('setBitbloqLibsVersion ' + version);
            return libVersionPromise.promise;
        };

        web2board._openCommunication = function (instructions, showUpdateModalFlag, tryCount) {
            tryCount = tryCount || 0;
            instructions = instructions || angular.noop();
            tryCount++;

            showUpdateModalFlag = showUpdateModalFlag === true && tryCount >= TIMES_TRY_TO_START_W2B;
            //It is not mandatory to have a board connected to verify the code
            web2board._connect()
                .then(function () {
                    web2board._checkVersion().then(function () {
                        web2board._checkLibVersion().then(function () {
                            instructions();
                        });
                    });
                })
                .catch(function () {
                    if (showUpdateModalFlag) {
                        inProgress = false;
                        showUpdateModal();
                    } else {
                        if (tryCount === 1) {
                            // we only need to start web2board once
                            startWeb2board();
                        }
                        $timeout(function () {
                            web2board._openCommunication(instructions, true, tryCount);
                        }, TIME_FOR_WEB2BOARD_TO_START);
                    }
                });
        };

        /**
         * $on listeners
         */

        $rootScope.$on('web2board:boardReady', function (evt, data) {
            var dataParsed = [];
            if (data) {
                dataParsed = JSON.parse(data);
            }

            if (dataParsed.length > 0) {
                //Take the first board
                web2board.config.serialPort = dataParsed[0];
                boardReadyPromise.resolve(dataParsed[0]);
            } else {
                web2board.config.serialPort = '';
                boardReadyPromise.reject();
            }
        });

        $rootScope.$on('web2board:code-verified', function (evt, data) {
            $log.debug(evt.name);
            if (data && data.charAt(0) === '{') {
                $log.debug(JSON.parse(data));
            }
        });

        $rootScope.$on('web2board:code-uploaded', function (evt, data) {
            $log.debug(evt.name);
            if (data && data.charAt(0) === '{') {
                $log.debug(JSON.parse(data));
            }
        });

        $rootScope.$on('web2board:version', function (evt, data) {
            if (parseInt(data.replace(/\./g, ''), 10) < parseInt(common.properties.web2boardVersion.replace(/\./g, ''), 10)) {
                versionPromise.reject();
                var parent = $rootScope,
                    modalOptions = parent.$new();
                _.extend(modalOptions, {
                    contentTemplate: '/views/modals/downloadWeb2board.html',
                    modalTitle: 'modal-update-web2board-title',
                    modalText: 'modal-download-web2board-text'
                });
                modalOptions.envData = envData;
                ngDialog.closeAll();
                ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--download-web2board',
                    scope: modalOptions,
                    showClose: true
                });
                $rootScope.$emit('web2board:wrong-version');
            } else {
                versionPromise.resolve();
            }
        });

        $rootScope.$on('web2board:bitbloqlibs-setted', function (evt, data) {
            $log.debug(evt.name + data);
            libVersionPromise.resolve();
        });

        /** Public functions */

        web2board.verify = function (code) {
            if (isWeb2board2Flag === null) {
                firstFunctionCalled.name = 'verify';
                firstFunctionCalled.args = [code];
                firstFunctionCalled.alertServiceTag = 'compile';
            }
            //It is not mandatory to have a board connected to verify the code
            web2board._openCommunication(function () {
                return web2board._send('compile ' + code);
            });
        };

        web2board.upload = function (board, code) {
            if (isWeb2board2Flag === null) {
                firstFunctionCalled.name = 'upload';
                firstFunctionCalled.args = [board.mcu, code];
                firstFunctionCalled.alertServiceTag = 'upload';
            }
            if (!code || !board) {
                $rootScope.$emit('web2board:boardNotReady');
                return false;
            }
            //It is not mandatory to have a board connected to verify the code
            web2board._openCommunication(function () {
                return web2board._setBoard(board.mcu).then(function () {
                    web2board._send('upload ' + code);
                });
            });
        };

        web2board.serialMonitor = function (board) {
            if (isWeb2board2Flag === null) {
                firstFunctionCalled.name = 'serialMonitor';
                firstFunctionCalled.args = [board];
                firstFunctionCalled.alertServiceTag = 'serialmonitor';
            }
            web2board._openCommunication(function () {
                return web2board._setBoard(board.mcu).then(function () {
                    web2board._send('SerialMonitor ' + web2board.serialPort);
                });
            });
        };

        web2board.chartMonitor = function (board) {
            if (isWeb2board2Flag === null) {
                firstFunctionCalled.name = 'chartMonitor';
                firstFunctionCalled.args = [board];
                firstFunctionCalled.alertServiceTag = 'chartMonitor';
            }
            web2board._openCommunication(function () {
                console.error('We should never enter here');
            });
        };

        web2board.version = function () {
            if (isWeb2board2Flag === null) {
                firstFunctionCalled.name = 'verify';
                firstFunctionCalled.args = [];
            }
            web2board._openCommunication();
        };

        web2board.isWeb2board2 = function () {
            return isWeb2board2Flag;
        };

        web2board.isInProcess = function () {
            if (isWeb2board2Flag) {
                return web2board2.isInProcess();
            }
            return inProgress;
        };

        web2board.setInProcess = function (value) {
            inProgress = value;
        };

        web2board.showSettings = function () {
            if (isWeb2board2Flag === null) {
                firstFunctionCalled.name = 'showSettings';
                firstFunctionCalled.args = [];
                firstFunctionCalled.alertServiceTag = 'showSettings';
            }
            alertsService.add('web2board_toast_startApp', 'web2board', 'loading');
            web2board._openCommunication(showUpdateModal);
        };

        web2board.uploadHex = function (hex, boardMcu) {
            if (isWeb2board2Flag === null) {
                firstFunctionCalled.name = 'uploadHex';
                firstFunctionCalled.args = [hex, boardMcu];
                firstFunctionCalled.alertServiceTag = '';
            }
            alertsService.add('web2board_toast_startApp', 'web2board', 'loading');
            web2board._openCommunication(showUpdateModal);
        };

        return web2board;
    });
