'use strict';
/* global js_beautify */

/**
 * @ngdoc function
 * @name bitbloqApp.controller:CodeCtrl
 * @description
 * # CodeCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('CodeCtrl', function($scope, $q, projectApi, $routeParams, _, alertsService, $timeout, utils, $location, web2board, $window, $rootScope, commonModals, $route, web2boardOnline, common, compilerApi, hardwareConstants, projectService) {


        $scope.projectService = projectService;

        $window.onbeforeunload = confirmExit;

        $scope.$on('$destroy', function() {
            $window.onbeforeunload = null;
        });

        function confirmExit() {
            var closeMessage;
            if (projectService.saveStatus === 1) {
                closeMessage = $scope.common.translate('leave-without-save');
            }
            return closeMessage;
        }

        function uploadW2b1() {
            $scope.$emit('uploading');
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            if (projectService.project.hardware.board) {
                web2board.setInProcess(true);
                var boardMetadata = projectService.getBoardMetaData();
                settingBoardAlert = alertsService.add({
                    text: 'alert-web2board-settingBoard',
                    id: 'upload',
                    type: 'loading'
                });
                web2board.setInProcess(true);

                web2board.upload(boardMetadata, utils.prettyCode(projectService.project.code));
            } else {
                $scope.currentTab = 'info';
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'upload',
                    type: 'warning'
                });
            }
        }

        function uploadW2b2() {
            if (projectService.project.hardware.board) {
                web2board.upload(projectService.getBoardMetaData().mcu, utils.prettyCode(projectService.project.code));
            } else {
                $scope.currentTab = 'info';
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'upload',
                    type: 'warning'
                });
            }
        }

        function verifyW2b1() {
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            web2board.setInProcess(true);

            compilingAlert = alertsService.add({
                text: 'alert-web2board-compiling',
                id: 'compile',
                type: 'loading'
            });
            web2board.setInProcess(true);

            web2board.verify(utils.prettyCode(projectService.project.code));
        }

        function verifyW2b2() {
            web2board.verify(utils.prettyCode(projectService.project.code));
        }

        function serialMonitorW2b1() {
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            if (projectService.project.hardware.board) {
                web2board.setInProcess(true);
                serialMonitorAlert = alertsService.add({
                    text: 'alert-web2board-openSerialMonitor',
                    id: 'serialmonitor',
                    type: 'loading'
                });
                var boardMetadata = projectService.getBoardMetaData();
                web2board.serialMonitor(boardMetadata);
            } else {
                $scope.currentTab = 'info';
                alertsService.add({
                    text: 'alert-web2board-no-board-serial',
                    id: 'serialmonitor',
                    type: 'warning'
                });
            }
        }

        function serialMonitorW2b2() {
            if (projectService.project.hardware.board) {
                web2board.serialMonitor(projectService.getBoardMetaData());
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-no-board-serial',
                    id: 'serialmonitor',
                    type: 'warning'
                });
            }
        }

        $scope.isWeb2BoardInProgress = web2board.isInProcess;

        $scope.getSavingStatusIdLabel = projectApi.getSavingStatusIdLabel;

        $scope.toggleCollapseHeader = function() {
            $scope.collapsedHeader = !$scope.collapsedHeader;
        };

        $scope.verify = function() {
            if (common.useChromeExtension()) {
                var board = projectService.getBoardMetaData();
                if (!board) {
                    board = 'bt328';
                } else {
                    board = board.mcu;
                }
                compilerApi.compile({
                    board: board,
                    code: utils.prettyCode(projectService.project.code)
                }).then(function(response) {
                    console.log('response');
                    console.log(response);
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
            } else {
                if (web2board.isWeb2boardV2()) {
                    verifyW2b2();
                } else {
                    verifyW2b1();
                }
            }
        };

        $scope.upload = function() {
            if (common.useChromeExtension()) {
                web2boardOnline.compileAndUpload({
                    board: projectService.getBoardMetaData(),
                    code: utils.prettyCode(projectService.project.code)
                });
            } else {
                if (web2board.isWeb2boardV2()) {
                    uploadW2b2();
                } else {
                    uploadW2b1();
                }
            }
        };

        $scope.onFieldKeyUp = function(event) {
            if ((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() === 's') { //Ctrl + S
                return true;
            }
        };

        $scope.uploadProject = function(project) {
            projectService.setProject(project);
            $scope.setBoard(projectService.project.board);
            _prettyCode();
        };

        $scope.setBoard = function(boardName) {
            var indexTag = projectService.project.hardwareTags.indexOf(projectService.project.hardware.board);
            if (indexTag !== -1) {
                projectService.project.hardwareTags.splice(indexTag, 1);
            }
            projectService.project.hardware.board = boardName || 'bq ZUM'; //Default board is ZUM
            var boardMetadata = projectService.getBoardMetaData();
            $scope.boardImage = boardMetadata && boardMetadata.id;
            projectService.project.hardwareTags.push(projectService.project.hardware.board);
        };

        $scope.serialMonitor = function() {
            if (web2board.isWeb2boardV2()) {
                serialMonitorW2b2();
            } else {
                serialMonitorW2b1();
            }
        };

        $scope.showWeb2boardSettings = function() {
            web2board.showSettings();
        };

        $scope.publishProject = function(type) {
            projectService.checkPublish(type).then(function() {
                $scope.publishProjectError = false;
                if (type === 'Social') {
                    commonModals.shareSocialModal(projectService.project);
                } else {
                    commonModals.publishModal(projectService.project);
                }
            }.catch(function() {
                $scope.publishProjectError = true;
                $scope.currentTab = 'info';
            }));
        };


        function _goToBloqs() {
            alertsService.close(editInfo);
            $location.url('/bloqsproject/' + projectService.project._id);
        }

        function _prettyCode() {
            var currentCursor = editorRef.getCursorPosition(),
                defered = $q.defer(),
                tmpCode = '';

            // Options
            editorRef.$blockScrolling = Infinity;
            editorRef.setAutoScrollEditorIntoView(true);

            //Prepare string to js_beautify
            function insertBeautyIgnores(match) {
                return '/* beautify ignore:start */' + match + '/* beautify ignore:end */';
            }

            //Remove beautify ignore & preserve sections
            tmpCode = js_beautify(projectService.project.code.replace(/(#include *.*)/gm, insertBeautyIgnores).replace(/(#define *.*)/gm, insertBeautyIgnores)).replace(/(\/\* (beautify)+ .*? \*\/)/gm, ''); // jshint ignore:line

            $timeout(function() {

                projectService.project.code = tmpCode;
                $timeout(function() {
                    editorRef.moveCursorTo(currentCursor.row, currentCursor.column, true);
                });
                defered.resolve();
            });

            return defered.promise;
        }

        function _loadProject() {

            if ($routeParams.id) {
                projectApi.get($routeParams.id).then(function(response) {
                    projectService.setProject(response.data);
                    if ($scope.common.user && projectService.project._acl['user:' + $scope.common.user._id] && projectService.project._acl['user:' + $scope.common.user._id].permission === 'READ') {
                        $scope.disablePublish = true;
                    }
                    if (!response.data.codeProject) {
                        editInfo = alertsService.add({
                            text: 'code-project_alert_edit-code',
                            id: 'edit-project',
                            type: 'warning',
                            time: 7000,
                            linkText: 'undo',
                            link: _goToBloqs
                        });
                    }
                    if (!projectService.project.codeProject) {
                        projectService.project.hardwareTags = [];
                    }
                    projectService.project.codeProject = true;

                    $scope.setBoard(projectService.project.hardware.board);

                    _prettyCode();

                }, function(response) {
                    switch (response.status) {
                        case 404: //not_found
                            alertsService.add({
                                text: 'no-project',
                                id: 'load-project',
                                type: 'warning'
                            });
                            break;
                        case 401: //unauthorized
                            $route.current.pathParams.id = '';
                            $location.url('/codeproject/');
                            alertsService.add({
                                text: 'alert_text_errorProjectUnauthorized',
                                id: 'load-project',
                                type: 'warning'
                            });
                            break;
                        default:
                            alertsService.add({
                                text: 'alert_text_errorProjectUndefined',
                                id: 'load-project',
                                type: 'warning'
                            });
                    }
                });
            } else {
                if ($scope.common.session.bloqTab) {
                    editInfo = alertsService.add({
                        text: 'code-project_alert_edit-code',
                        id: 'edit-project',
                        type: 'warning'
                    });
                }

                $scope.common.itsUserLoaded().then(function() {
                    if ($scope.common.session.save) {
                        projectService.setProject($scope.common.session.project);
                        $scope.common.session.save = false;
                        projectService.startAutosave();
                    } else {
                        projectService.setCodeProject();
                    }
                    $scope.setBoard(projectService.project.hardware.board);
                    _prettyCode();
                }).catch(function() {
                    if ($scope.common.session.project.hardware.board) {
                        $scope.setBoard($scope.common.session.project.hardware.board);
                        _prettyCode();
                    }
                    if ($scope.common.session.project.code) {
                        projectService.setProject($scope.common.session.project);
                        _prettyCode();
                    } else {
                        projectService.setCodeProject();
                    }
                });
            }
        }

        var editInfo, editorRef,
            compilingAlert,
            settingBoardAlert,
            serialMonitorAlert;

        $scope.utils = utils;
        $scope.projectApi = projectApi;

        $scope.boardNameList = [];
        $scope.commonModals = commonModals;
        $scope.common.isLoading = true;

        $scope.boardNameList = _.pluck(hardwareConstants.boards, 'name');

        // The ui-ace option
        $scope.aceOptions = {
            mode: 'c_cpp',
            useWrapMode: false,
            showGutter: true,
            theme: 'chrome',
            advanced: {
                enableSnippets: true,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true
            },
            rendererOptions: {
                fontSize: 14,
                minLines: 11
            },
            onLoad: function(_editor) {
                editorRef = _editor;
                _loadProject();
                editorRef.on('paste', function() {
                    setTimeout(function() {
                        _prettyCode();
                    }, 10);
                });
            }
        };

        $scope.$watch('common.session.save', function(newVal, oldVal) {
            if (newVal && newVal !== oldVal) {
                $scope.common.session.project = projectService.project;
            }
        });

        /*************************************************
         web2board communication
         *************************************************/

        $rootScope.$on('web2board:disconnected', function() {
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:wrong-version', function() {
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:no-web2board', function() {
            alertsService.close(compilingAlert);
            alertsService.close(settingBoardAlert);
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:compile-error', function(event, error) {
            error = JSON.parse(error);
            alertsService.add({
                text: 'alert-web2board-compile-error',
                id: 'compile',
                type: 'warning'
            });
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:compile-verified', function() {
            alertsService.add({
                text: 'alert-web2board-compile-verified',
                id: 'compile',
                type: 'ok',
                time: 5000
            });
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:boardReady', function(evt, data) {
            data = JSON.parse(data);
            if (data.length > 0) {
                if (!alertsService.isVisible('uid', serialMonitorAlert)) {
                    alertsService.add({
                        text: 'alert-web2board-boardReady',
                        id: 'upload',
                        type: 'ok',
                        time: 5000,
                        value: data[0]
                    });
                }
            } else {
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'upload',
                    type: 'warning'
                });
            }
        });

        $rootScope.$on('web2board: boardNotReady', function() {
            alertsService.add({
                text: 'alert-web2board-boardNotReady',
                id: 'upload',
                type: 'warning'
            });
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:uploading', function(evt, port) {
            alertsService.add({
                text: 'alert-web2board-uploading',
                id: 'upload',
                type: 'loading',
                value: port
            });
            web2board.setInProcess(true);
        });

        $rootScope.$on('web2board:code-uploaded', function() {
            alertsService.add({
                text: 'alert-web2board-code-uploaded',
                id: 'upload',
                type: 'ok',
                time: 5000
            });
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:upload-error', function(evt, data) {
            data = JSON.parse(data);
            if (!data.error) {
                alertsService.add({
                    text: 'alert-web2board-upload-error',
                    id: 'upload',
                    type: 'warning'
                });
            } else if (data.error === 'no port') {
                alertsService.add({
                    text: 'alert-web2board-upload-error',
                    id: 'upload',
                    type: 'warning'
                });
            } else {
                alertsService.add({
                    text: 'alert-web2board-upload-error',
                    id: 'upload',
                    type: 'warning',
                    value: data.error
                });
            }
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:no-port-found', function() {
            $scope.currentTab = 'info';
            web2board.setInProcess(false);
            alertsService.close(serialMonitorAlert);
            alertsService.add({
                text: 'alert-web2board-no-port-found',
                id: 'upload',
                type: 'warning'
            });
        });

        $rootScope.$on('web2board:serial-monitor-opened', function() {
            alertsService.close(serialMonitorAlert);
            web2board.setInProcess(false);
        });
    });
