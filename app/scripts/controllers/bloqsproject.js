'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:BloqsprojectCtrl
 * @description
 * # BloqsprojectCtrl
 * Controller of the bitbloqApp
 */

angular.module('bitbloqApp')
    .controller('BloqsprojectCtrl', function($rootScope, $route, $scope, $log, $timeout, $routeParams, $document, $window, $location, web2board, alertsService, ngDialog, _, projectApi, bloqs, bloqsUtils, utils, userApi, commonModals, hw2Bloqs, common, web2boardOnline, projectService) {


        /*************************************************
         Project save / edit
         *************************************************/


        $scope.setCode = function(code) {
            $scope.code = code;
        };

        $scope.uploadProject = function(project) {
            $scope.hardware.firstLoad = true;
            if ($scope.hardware.cleanSchema) {
                $scope.hardware.cleanSchema();
            }
            projectService.setProject(project);
            $scope.refreshComponentsArray();
        };

        $scope.refreshComponentsArray = function() {
            var newComponentsArray = bloqsUtils.getEmptyComponentsArray();
            var newHardwareTags = [];

            var plainComponentListTemporal = [];
            var plainComponentList = [];
            projectService.project.hardware.components.forEach(function(comp) {
                if (!!comp.connected) {
                    if (comp.oscillator === true || comp.oscillator === 'true') {
                        newComponentsArray.oscillators.push(_.cloneDeep(comp));
                    } else {
                        newComponentsArray[comp.category].push(_.cloneDeep(comp));
                    }
                    plainComponentListTemporal.push({
                        'uid': comp.uid,
                        'name': comp.name
                    });
                    newHardwareTags.push(comp.id);
                }
            });

            if (projectService.project.hardware.robot) {
                newComponentsArray.robot.push(projectService.project.hardware.robot);
            }

            if (projectService.componentsArray.robot.length > 0) {
                plainComponentList = projectService.componentsArray.robot;
            } else {
                _.forEach(projectService.componentsArray, function(n, key) {
                    var compUidList = _.map(projectService.componentsArray[key], function(item) {
                        return {
                            'uid': item.uid,
                            'name': item.name
                        };
                    });
                    if (compUidList && compUidList.length > 0) {
                        plainComponentList = plainComponentList.concat(compUidList);
                    }
                });
            }

            if (!_.isEqual(projectService.componentsArray, newComponentsArray)) {
                //Regenerate hw tags
                projectService.project.hardwareTags = _.uniq(newHardwareTags);
                if (projectService.project.hardware.robot) {
                    projectService.project.hardwareTags.push(projectService.project.hardware.robot);
                } else if (projectService.project.hardware.board) {
                    projectService.project.hardwareTags.push(projectService.project.hardware.board);
                }
                //update
                projectService.setComponentsArray(newComponentsArray);
                bloqs.componentsArray = newComponentsArray;
                $scope.updateBloqs();
                if (!$scope.hardware.firstLoad) {
                    projectService.startAutosave();
                    $scope.hardware.firstLoad = false;
                }
            }
        };

        $scope.anyComponent = function(forceCheck) {
            if ($scope.currentTab === 0 && !forceCheck) { //software Toolbox not visible
                return false;
            }
            if (_.isEqual(projectService.componentsArray, bloqsUtils.getEmptyComponentsArray())) {
                return false;
            }
            var compCategories = _.pick(projectService.componentsArray, function(item) {
                return item.length > 0;
            });
            var tmpCompCategories = _.cloneDeep(compCategories);
            if (tmpCompCategories.robot) {
                delete tmpCompCategories.robot;
            }

            return (Object.keys(tmpCompCategories).length > 0);
        };
        $scope.anyAdvancedComponent = function() {
            return !_.isEqual(projectService.componentsArray, bloqsUtils.getEmptyComponentsArray());
        };
        $scope.anySerialComponent = function() {
            return projectService.componentsArray.serialElements.length > 0;
        };

        $scope.closeMenu = function() {
            $scope.levelOne = $scope.levelTwo = $scope.submenuVisible = false;
        };

        $scope.subMenuHandler = function(menu, action, level) {
            if (action === 'open') {
                $scope.$emit('menu--open');
                switch (level) {
                    case 1:
                        $scope.levelOne = menu;
                        $scope.levelTwo = false;
                        break;
                    case 2:

                        $scope.levelTwo = menu;
                        break;
                    default:
                        throw 'Error opening sidebar menu';
                }
            } else {
                switch (level) {
                    case 1:
                        $scope.levelOne = false;
                        $scope.levelTwo = false;
                        break;
                    case 2:
                        $scope.levelTwo = false;
                        break;
                    default:
                        throw 'Error closing sidebar menu';
                }
            }
        };

        $scope.setLevelTwo = function() {
            $scope.levelTwo = !$scope.levelTwo;
            $scope.submenuSecondVisible = !$scope.submenuSecondVisible;
            $scope.$apply();
        };

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
                type: 'warning',
                value: error.stdErr
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
                    type: 'warning',
                    value: data.stdErr
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
            $scope.currentTab = 0;
            $scope.levelOne = 'boards';
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

        $scope.isWeb2BoardInProgress = web2board.isInProcess;

        function uploadW2b1() {
            $scope.$emit('uploading');
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            if (projectService.project.hardware.board) {
                web2board.setInProcess(true);
                var boardReference = projectService.getBoardMetaData();
                settingBoardAlert = alertsService.add({
                    text: 'alert-web2board-settingBoard',
                    id: 'upload',
                    type: 'loading'
                });
                web2board.setInProcess(true);

                web2board.upload(boardReference, $scope.getPrettyCode());
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'upload',
                    type: 'warning'
                });
            }
        }

        function uploadW2b2() {
            if (projectService.project.hardware.board) {
                web2board.upload(projectService.getBoardMetaData().mcu, $scope.getPrettyCode());
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

            web2board.verify($scope.getPrettyCode());
        }

        function verifyW2b2() {
            web2board.verify($scope.getPrettyCode());
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
                var boardReference = projectService.getBoardMetaData();
                web2board.serialMonitor(boardReference);
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

        $scope.verify = function() {
            if (common.useChromeExtension()) {
                web2boardOnline.compile({
                    board: projectService.getBoardMetaData(),
                    code: $scope.getPrettyCode()
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
            if (projectService.project.hardware.board) {
                if (common.useChromeExtension()) {
                    web2boardOnline.compileAndUpload({
                        board: projectService.getBoardMetaData(),
                        code: $scope.getPrettyCode()
                    });
                } else {
                    if (web2board.isWeb2boardV2()) {
                        uploadW2b2();
                    } else {
                        uploadW2b1();
                    }
                }
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-boardNotReady',
                    id: 'web2board',
                    type: 'warning'
                });
            }
        };

        $scope.serialMonitor = function() {
            if (projectService.project.hardware.board) {
                if (common.useChromeExtension()) {
                    commonModals.launchSerialWindow(projectService.getBoardMetaData());
                } else {
                    if (web2board.isWeb2boardV2()) {
                        serialMonitorW2b2();
                    } else {
                        serialMonitorW2b1();
                    }
                }
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-no-board-serial',
                    id: 'serialmonitor',
                    type: 'warning'
                });
            }
        };

        $scope.chartMonitor = function() {
            if (projectService.project.hardware.board) {
                web2board.chartMonitor(projectService.getBoardMetaData());
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add({
                    text: 'alert-web2board-no-board-serial',
                    id: 'serialmonitor',
                    type: 'warning'
                });
            }
        };

        $scope.showWeb2boardSettings = function() {
            web2board.showSettings();
        };

        $scope.getCode = function() {
            $scope.updateBloqs();
            return projectService.getCode();
        };

        $scope.getPrettyCode = function() {
            return utils.prettyCode($scope.getCode());
        };

        /* ****** */

        $scope.informErrorAction = function() {

            var confirmAction = function() {
                    ngDialog.close('ngdialog1');
                },
                parent = $rootScope,
                modalOptions = parent.$new();

            _.extend(modalOptions, {
                title: 'make-actions-share-with-users',
                confirmOnly: true,
                buttonConfirm: 'make-actions-share-with-users-confirm',
                contentTemplate: '/views/modals/shareWithUsers.html',
                confirmAction: confirmAction
            });

            ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--share-with-users',
                scope: modalOptions,
                showClose: false
            });
        };

        $scope.updateBloqs = function() {

            if (projectService.bloqs.varsBloq) {

                var allBloqs = bloqs.bloqs;
                var allComponents = [];

                //Why?
                for (var bloq in allBloqs) {
                    allBloqs[bloq].componentsArray = projectService.componentsArray;
                }

                var updateBloq = function(element, list) {

                    var tempValue,
                        tempRef;

                    tempRef = element.dataset.reference;
                    tempValue = element.dataset.value;

                    bloqsUtils.drawDropdownOptions($(element), list);

                    if (tempRef && tempValue) {

                        var componentRef = list.find(function(comp) {
                            return comp.uid === tempRef;
                        });

                        if (componentRef) {
                            element.value = componentRef.name;
                            element.dataset.reference = componentRef.uid;
                            element.dataset.value = componentRef.name;
                        }

                    } else {
                        $log.debug('dropdown not selected');
                        element.selectedIndex = 0;
                    }
                };
                var bloqCanvasEl = null;
                //Update dropdowns values from bloqs canvas
                for (var type in projectService.componentsArray) {
                    if (projectService.componentsArray[type].length) {
                        bloqCanvasEl = document.getElementsByClassName('bloqs-tab')[0];
                        var nodeList = bloqCanvasEl.querySelectorAll('select[data-dropdowncontent="' + type + '"]');
                        for (var i = 0, len = nodeList.length; i < len; i++) {
                            updateBloq(nodeList[i], projectService.componentsArray[type]);
                        }
                        allComponents = allComponents.concat(projectService.componentsArray[type]);
                    }
                }
                //Update dropdowns from bloqs of toolbox
                if (bloqCanvasEl) {
                    var toolboxNodeList = bloqCanvasEl.querySelectorAll('select[data-dropdowncontent="varComponents"]');
                    for (var j = 0, len2 = toolboxNodeList.length; j < len2; j++) {
                        updateBloq(toolboxNodeList[j], allComponents);
                    }

                    var varServos = [];
                    varServos = varServos.concat(projectService.componentsArray.servos, projectService.componentsArray.oscillators, projectService.componentsArray.continuousServos);
                    var servosNodeList = bloqCanvasEl.querySelectorAll('select[data-dropdowncontent="allServos"]');
                    for (var y = 0, lenServo = servosNodeList.length; y < lenServo; y++) {
                        updateBloq(servosNodeList[y], varServos);
                    }
                }

            }
        };

        /*************************************************
         Tab settings
         *************************************************/
        $scope.currentTab = 0;

        $scope.setTab = function(index) {
            if (index === 0) {
                hw2Bloqs.repaint();
            } else if (index === 1) {
                if ($scope.toolbox.level !== 1) {
                    $scope.toolbox.level = 1;
                }
                $scope.setCode($scope.getCode());
                $rootScope.$emit('currenttab:bloqstab');
            }

            $scope.currentTab = index;
        };

        $scope.saveBloqStep = function(step) {
            //$log.debug('Guardamos Estado de Bloqs');
            var freeBloqs = bloqs.getFreeBloqs();
            //$log.debug(freeBloqs);
            step = step || {
                    vars: projectService.bloqs.varsBloq.getBloqsStructure(),
                    setup: projectService.bloqs.setupBloq.getBloqsStructure(),
                    loop: projectService.bloqs.loopBloq.getBloqsStructure(),
                    freeBloqs: freeBloqs
                };
            saveStep(step, $scope.bloqsHistory);
        };

        $scope.undoBloqStep = function() {
            undo($scope.bloqsHistory, function(step) {
                projectService.project.software = step;
            });
        };

        $scope.redoBloqStep = function() {
            redo($scope.bloqsHistory, function(step) {
                projectService.project.software = step;
            });
        };

        $scope.disableUndo = function() {
            var condition = false;
            switch ($scope.currentTab) {
                case 0:
                    condition = $scope.hardwareHistory.pointer <= 1;
                    break;
                case 1:
                    // condition = true;
                    break;
            }
            return condition;
        };

        $scope.disableRedo = function() {
            var condition = false;
            switch ($scope.currentTab) {
                case 0:
                    condition = !(($scope.hardwareHistory.pointer < ($scope.hardwareHistory.history.length)) && $scope.hardwareHistory.pointer >= 1);
                    break;
                case 1:
                    // condition = true;
                    break;
            }
            return condition;
        };

        $scope.undo = function() {
            switch ($scope.currentTab) {
                case 0:
                    $scope.undoHardwareStep();
                    break;
                case 1:
                    $scope.undoBloqStep();
                    break;
            }
        };

        $scope.redo = function() {
            switch ($scope.currentTab) {
                case 0:
                    $scope.redoHardwareStep();
                    break;
                case 1:
                    $scope.redoBloqStep();
                    break;
            }
        };

        $scope.toggleCollapseHeader = function() {
            $scope.collapsedHeader = !$scope.collapsedHeader;
            hw2Bloqs.repaint();
        };

        $scope.publishProject = function(type) {
            projectService.checkPublish(type).then(function() {
                var projectDefault = projectService.getDefaultProject();
                projectService.completedProject();
                delete projectDefault.software.freeBloqs;
                if (_.isEqual(projectDefault.software, projectService.project.software)) {
                    alertsService.add({
                        text: 'publishProject__alert__bloqsProjectEmpty' + type,
                        id: 'publishing-project',
                        type: 'warning'
                    });
                } else {
                    $scope.publishProjectError = false;
                    if (type === 'Social') {
                        commonModals.shareSocialModal(projectService.project);
                    } else {
                        commonModals.publishModal(projectService.project);
                    }
                }
            }).catch(function() {
                $scope.publishProjectError = true;
                $scope.setTab(2);
            });
        };


        /*************************************************
         UNDO / REDO
         *************************************************/

        //Stores one step in the history
        function saveStep(step, options) {
            options.history = _.take(options.history, options.pointer);
            options.history.push(_.cloneDeep(step));
            options.pointer++;
        }

        function undo(options, callback) {
            if (options.pointer > 1) {
                options.pointer--;
                callback(options.history[options.pointer - 1]);
                $log.debug('actual position', options.pointer);
                projectService.startAutosave();
                $scope.hardware.firstLoad = false;
            }
        }

        function redo(options, callback) {
            if (options.pointer < options.history.length) {
                callback(options.history[options.pointer]);
                options.pointer++;
                $log.debug('actual position', options.pointer);
                projectService.startAutosave();
                $scope.hardware.firstLoad = false;
            }
        }

        function addProjectWatchersAndListener() {
            projectService.addWatchers();
            $scope.$watch('code', function(newVal, oldVal) {
                if (newVal !== oldVal && oldVal !== '') {
                    projectService.startAutosave();
                    $scope.hardware.firstLoad = false;
                }
            });

            $window.addEventListener('bloqs:dragend', function() {
                $scope.saveBloqStep();
                projectService.startAutosave();
                $scope.hardware.firstLoad = false;
                $scope.$apply();
            });

            $window.addEventListener('bloqs:change', function() {
                if (projectService.bloqs.loopBloq) {
                    $scope.saveBloqStep();
                    projectService.startAutosave();
                    $scope.hardware.firstLoad = false;
                    $scope.$apply();
                }

            });
        }

        function launchModalTour() {
            ngDialog.closeAll();
            var modalTour = $rootScope.$new(),
                modalTourInit;
            _.extend(modalTour, {
                contentTemplate: '/views/modals/infoTour.html',
                confirmAction: $scope.handleTour,
                rejectAction: $scope.tourDone
            });
            modalTourInit = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--alert',
                scope: modalTour,
                showClose: false,
                closeByDocument: false
            });
        }

        function launchModalAlert() {
            var modalTourStep = $rootScope.$new();
            _.extend(modalTourStep, {
                contentTemplate: '/views/modals/alert.html',
                text: 'modal-tour-step',
                confirmText: 'modal__understood-button',
                confirmAction: showStepFive
            });
            ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--alert',
                scope: modalTourStep,
                showClose: false
            });

        }

        function showStepFive() {
            ngDialog.closeAll();
            $scope.tourCurrentStep = 5;
        }

        function launchModalGuest() {
            var modalGuest = $rootScope.$new(),
                modalGuestInit;
            _.extend(modalGuest, {
                contentTemplate: '/views/modals/alert.html',
                confirmAction: function() {
                    ngDialog.closeAll();
                    $scope.common.goToLogin();
                },
                cancelButton: true,
                text: 'modal-not-registered-text',
                cancelText: 'continue-as-guest',
                confirmText: 'enter-or-register',
                rejectAction: launchModalTour
            });

            modalGuestInit = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--alert',
                scope: modalGuest,
                showClose: false,
                closeByDocument: false
            });
        }

        function checkBackspaceKey(event) {
            if (event.which === 8 &&
                event.target.nodeName !== 'INPUT' &&
                event.target.nodeName !== 'SELECT' &&
                event.target.nodeName !== 'TEXTAREA' && !$document[0].activeElement.attributes['data-bloq-id']) {

                event.preventDefault();
            }
        }

        $scope.handleTour = function(step) {

            step = step || 1;
            switch (step) {
                case 1:
                    if (!$scope.tourCurrentStep) {
                        $scope.tourCurrentStep = 1;
                    }
                    break;
                case 2:
                    if ($scope.tourCurrentStep === 1) {

                        $scope.tourCurrentStep = 2;
                        var runStepThree = $scope.$on('menu--open', function() {
                            $timeout(function() {
                                $('.submenu-level').animate({
                                    scrollTop: $('[dragid="led"]').offset().top - 150
                                }, 'slow');
                                $scope.handleTour(3);
                                runStepThree();
                            }, 0);
                        });
                    }
                    break;
                case 3:
                    if ($scope.tourCurrentStep === 2) {
                        $scope.tourCurrentStep = 3;
                        var runStepFour = $rootScope.$on('component-connected', function() {
                            $scope.handleTour(4);
                            runStepFour();
                        });
                    }
                    break;
                case 4:
                    if ($scope.tourCurrentStep === 3) {
                        $scope.tourCurrentStep = 4;
                    }
                    break;
                case 5:
                    if ($scope.tourCurrentStep === 4) {
                        launchModalAlert();
                    }
                    break;
                case 6:
                    if ($scope.tourCurrentStep === 5) {
                        $scope.tourCurrentStep = 6;
                        var runStepSeven = $window.addEventListener('bloqs:connect', function() {
                            $scope.handleTour(7);
                            runStepSeven();
                        });
                    }
                    break;
                case 7:
                    if ($scope.tourCurrentStep === 6) {
                        $scope.$apply(function() {
                            $scope.tourCurrentStep = 7;
                        });
                        var endTour = $scope.$on('uploading', function() {
                            $scope.tourDone();
                            endTour();
                        });
                    }
                    break;
                default:
                    throw 'not a tour step';
            }
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        };

        $scope.tourDone = function() {
            ngDialog.closeAll();
            $scope.tourCurrentStep = null;
            if ($scope.common.user) {
                $scope.common.user.takeTour = true;
                userApi.update({
                    takeTour: true
                });
            }
        };
        $scope.toolbox = {};
        $scope.toolbox.level = 1;

        //'Mad science', objects mantain reference, primitive values can't be passed for generic functions
        $scope.bloqsHistory = {
            pointer: 0,
            history: []
        };
        $scope.hardwareHistory = {
            pointer: 0,
            history: []
        };

        $scope.commonModals = commonModals;
        $scope.utils = utils;

        /*************************************************
         Project settings
         *************************************************/

        var compilingAlert,
            settingBoardAlert,
            serialMonitorAlert;

        $scope.shareWithUserTags = [];

        $scope.code = '';

        $scope.hardware = {
            componentList: null,
            robotList: null,
            cleanSchema: null,
            sortToolbox: null,
            firstLoad: true
        };

        $scope.projectApi = projectApi;
        $scope.projectService = projectService;

        projectService.initBloqProject();

        if (!$scope.common.user) {
            $scope.common.session.save = false;
        }

        /*************************************************
         Load project
         *************************************************/
        $scope.common.isLoading = true;

        $scope.common.itsUserLoaded().then(function() {
            $log.debug('There is a registed user');
            if ($routeParams.id) {
                loadProject($routeParams.id).finally(function() {
                    addProjectWatchersAndListener();
                });
            } else {
                addProjectWatchersAndListener();
                if ($scope.common.session.save) {
                    $scope.common.session.save = false;
                    projectService.setProject($scope.common.session.project);
                    projectService.startAutosave();
                    $scope.hardware.firstLoad = false;
                }
                if (!$scope.common.user.takeTour) {
                    launchModalTour();
                    projectService.initBloqProject();
                }
            }
        }, function() {
            $log.debug('no registed user');
            if ($routeParams.id) {
                loadProject($routeParams.id).finally(function() {
                    addProjectWatchersAndListener();
                });
            } else {
                addProjectWatchersAndListener();
                launchModalGuest();
            }
        });

        var loadProject = function(id) {
            return projectApi.get(id).then(function(response) {
                if (response.data.codeProject) {
                    $location.path('/codeproject/' + response.data._id);
                } else {
                    //set freebloqs object
                    if (response.data.software) {
                        response.data.software.freeBloqs = response.data.software.freeBloqs || [];
                    }

                    projectService.setProject(response.data);
                    $scope.saveBloqStep(_.clone(response.data.software));
                    projectService.saveOldProject();
                }
            }, function(error) {
                projectService.addWatchers();
                switch (error.status) {
                    case 404: //not_found
                        alertsService.add({
                            text: 'no-project',
                            id: 'load-project',
                            type: 'warning'
                        });
                        break;
                    case 401: //unauthorized
                        $location.path('/bloqsproject/');
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
        };

        function confirmExit() {
            var closeMessage;
            if (projectService.saveStatus === 1) {
                closeMessage = $scope.common.translate('leave-without-save');
            }
            return closeMessage;
        }

        $document.on('keydown', checkBackspaceKey);
        $window.onbeforeunload = confirmExit;

        $scope.$on('$destroy', function() {
            $document.off('keydown', checkBackspaceKey);
            $window.onbeforeunload = null;
        });

    });
