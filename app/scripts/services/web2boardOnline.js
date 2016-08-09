'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.web2boardOnline
 * @description
 * # web2boardOnline
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('web2boardOnline', function(compilerApi, chromeAppApi, alertsService, utils, $q, $translate) {
        var exports = {
            compile: compile,
            upload: upload
        };

        /**
         * [compile description]
         * @param  {object} params {
         *                         board: board profile,
         *                         code: code
         *                         }
         * @return {promise}
         */
        function compile(params) {
            if (!params.board) {
                params.board = 'bt328';
            } else {
                params.board = params.board.mcu;
            }

            alertsService.add({
                text: 'alert-web2board-compiling',
                id: 'web2board',
                type: 'loading'
            });

            var compilerPromise = compilerApi.compile(params);

            compilerPromise.then(function(response) {
                if (response.data.error) {
                    alertsService.add({
                        id: 'web2board',
                        type: 'warning',
                        translatedText: utils.parseCompileError(response.data.error)
                    });
                } else {
                    alertsService.add({
                        text: 'alert-web2board-compile-verified',
                        id: 'web2board',
                        type: 'ok',
                        time: 5000
                    });
                }
            });

            return compilerPromise;
        }

        /**
         *
         * @param  {object} params {
         *                         board: board profile,
         *                         code: code
         *                         }
         * @return {promise} request promise
         */
        function upload(params) {
            var uploadDefer = $q.defer();

            compile(params).then(function(response) {
                if (response.data.error) {
                    uploadDefer.reject(response);
                } else {
                    alertsService.add({
                        text: 'alert-web2board-uploading',
                        id: 'web2board',
                        type: 'loading'
                    });
                    chromeAppApi.isConnected().then(function() {
                        chromeAppApi.sendHex({
                            board: params.board,
                            file: response.data.hex
                        }).then(function(uploadHexResponse) {
                            uploadDefer.resolve(uploadHexResponse);
                        }).catch(function(error) {
                            uploadDefer.reject(error);
                        });
                    }).catch(function() {
                        alertsService.add({
                            text: $translate.instant('landing_howitworks_oval_2_chromeos'),
                            id: 'web2board',
                            type: 'warning',
                            time: 20000,
                            linkText: $translate.instant('from-here'),
                            link: chromeAppApi.installChromeApp,
                            linkParams: function(err, response) {
                                if (err) {
                                    alertsService.add({
                                        text: $translate.instant('error-chromeapp-install') + ': ' +  err,
                                        id: 'web2board',
                                        type: 'error'
                                    });
                                    uploadDefer.reject({
                                        msg: 'error on chromeapp installation',
                                        data: err
                                    });
                                } else {
                                    alertsService.add({
                                        text: $translate.instant('chromeapp-installed'),
                                        id: 'web2board',
                                        type: 'ok'
                                    });
                                    upload(params);
                                }
                            }
                        });
                    });
                }
            }).catch(function(error) {
                uploadDefer.reject(error);
            });
            return uploadDefer.promise;
        }

        return exports;
    });
