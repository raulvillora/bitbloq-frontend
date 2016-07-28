'use strict';
/**
 * @ngdoc service
 * @name bitbloqApp.web2board
 * @description
 * # web2board
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .factory('web2boardRequests', function ($rootScope, $websocket, $log, $q, ngDialog, _, $timeout, common, envData,
                                            alertsService, WSHubsAPIRequests, OpenWindow, $compile, $translate) {

        /** Variables */

        var web2board = this,
            api = WSHubsAPIRequests,
            inProgress = false;

        /*Private functions*/
        function removeInProgressFlag() {
            inProgress = false;
        }

        function handleCompileError(error) {
            var errorStr = error,
                alertParams = {
                    id: 'web2board',
                    type: 'warning'
                };
            if (typeof error === 'object') {
                var errorLines = [];
                error.forEach(function (errorLine) {
                    errorLines.push($translate.instant('alert-web2board-compile-line-error ', errorLine));
                });
                errorStr = errorLines.join('<br>');

                alertParams.translatedText = $translate.instant('alert-web2board-compile-error', {value: '<br>' + errorStr});
            } else {
                alertParams.text = 'alert-web2board-compile-error';
                alertParams.value = error;
            }

            alertsService.add(alertParams);
        }

        web2board.verify = function (code) {
            alertsService.add('alert-web2board-compiling', 'web2board', 'loading', undefined);
            return api.CodeHub.server.compile(code)
                .then(function () {
                    alertsService.add('alert-web2board-compile-verified', 'web2board', 'ok', 5000);
                })
                .catch(handleCompileError)
                .finally(removeInProgressFlag);
        };

        // web2board.upload = function (boardMcu, code) {
        //     alert('does not make sense');
        // };
        //
        // web2board.serialMonitor = function (board) {
        //     alert('does not make sense');
        // };
        //
        // web2board.chartMonitor = function (board) {
        //     alert('does not make sense');
        // };
        //
        // web2board.showSettings = function () {
        //     alert('does not make sense');
        // };

        web2board.version = api.VersionsHandlerHub.server.getVersion;

        // web2board.uploadHex = function (boardMcu, hexText) {
        //     alertsService.add('alert-web2board-settingBoard', 'web2board', 'loading');
        //     api.CodeHub.server.uploadHex(hexText, boardMcu)
        //         .then(updateSuccessfullyFinished, handleUploadError
        //         ).finally(removeInProgressFlag);
        // };


        return {
            verify: web2board.verify,
            upload: web2board.upload,
            serialMonitor: web2board.serialMonitor,
            chartMonitor: web2board.chartMonitor,
            version: web2board.version,
            uploadHex: web2board.uploadHex,
            showSettings: web2board.showSettings,
            isInProcess: function () {
                return inProgress;
            },
            setInProcess: function (value) {
                inProgress = value;
            },
            api: api
        };

    });
