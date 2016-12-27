'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:BloqstabCtrl
 * @description
 * # BloqstabCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('BloqstabCtrl', function($rootScope, $scope, $timeout, $translate, $window, common, bloqsUtils,
        bloqs, bloqsApi, $log, $document, _, ngDialog, $location, userApi, alertsService, web2board,
        robotFirmwareApi, web2boardOnline, projectService) {

        var $contextMenu = $('#bloqs-context-menu'),
            field = angular.element('#bloqs--field'),
            scrollBarContainer = angular.element('.make--scrollbar'),
            scrollBar = angular.element('.scrollbar--small'),
            bloqsTab = angular.element('.bloqs-tab');

        $scope.bloqsApi = bloqsApi;
        $scope.projectService = projectService;
        $scope.lastPosition = 0;

        $scope.$field = $('#bloqs--field').last();

        var bloqsLoadTimes = 0;

        $scope.init = function() {
            if (projectService.bloqs.varsBloq) {
                bloqs.removeBloq(projectService.bloqs.varsBloq.uuid, true);
                projectService.bloqs.varsBloq = null;
                bloqs.removeBloq(projectService.bloqs.setupBloq.uuid, true);
                projectService.bloqs.setupBloq = null;
                bloqs.removeBloq(projectService.bloqs.loopBloq.uuid, true);
                projectService.bloqs.loopBloq = null;
            }

            projectService.bloqs.varsBloq = bloqs.buildBloqWithContent(projectService.project.software.vars, projectService.componentsArray, bloqsApi.schemas, $scope.$field);
            projectService.bloqs.setupBloq = bloqs.buildBloqWithContent(projectService.project.software.setup, projectService.componentsArray, bloqsApi.schemas);
            projectService.bloqs.loopBloq = bloqs.buildBloqWithContent(projectService.project.software.loop, projectService.componentsArray, bloqsApi.schemas);

            $scope.$field.append(projectService.bloqs.varsBloq.$bloq, projectService.bloqs.setupBloq.$bloq, projectService.bloqs.loopBloq.$bloq);
            projectService.bloqs.varsBloq.enable(true);
            projectService.bloqs.varsBloq.doConnectable();

            projectService.bloqs.setupBloq.enable(true);
            projectService.bloqs.setupBloq.doConnectable();

            projectService.bloqs.loopBloq.enable(true);
            projectService.bloqs.loopBloq.doConnectable();

            bloqs.updateDropdowns();
        };

        $scope.initFreeBloqs = function() {
            var tempBloq, i, j,
                lastBottomConnector;

            bloqs.destroyFreeBloqs();
            if (projectService.project.software.freeBloqs && (projectService.project.software.freeBloqs.length > 0)) {
                for (i = 0; i < projectService.project.software.freeBloqs.length; i++) {
                    lastBottomConnector = null;
                    for (j = 0; j < projectService.project.software.freeBloqs[i].bloqGroup.length; j++) {
                        // $log.debug(projectService.project.software.freeBloqs[i].bloqGroup[j]);
                        tempBloq = bloqs.buildBloqWithContent(projectService.project.software.freeBloqs[i].bloqGroup[j], projectService.componentsArray, bloqsApi.schemas);

                        if (lastBottomConnector) {
                            bloqs.connectors[lastBottomConnector].connectedTo = tempBloq.connectors[0];
                            bloqs.connectors[tempBloq.connectors[0]].connectedTo = lastBottomConnector;

                        } else {
                            tempBloq.$bloq[0].style.transform = 'translate(' + projectService.project.software.freeBloqs[i].position.left + 'px,' + projectService.project.software.freeBloqs[i].position.top + 'px)';
                        }

                        lastBottomConnector = tempBloq.connectors[1];

                        $scope.$field.append(tempBloq.$bloq);
                        tempBloq.disable();
                        tempBloq.doConnectable();
                    }

                    bloqsUtils.redrawTree(tempBloq, bloqs.bloqs, bloqs.connectors);
                }
            }
            bloqsUtils.drawTree(bloqs.bloqs, bloqs.connectors);
        };

        $scope.goToCodeModal = function() {
            $scope.common.session.bloqTab = true;
            if ($scope.common.session.save) {
                projectService.project.code = $scope.code;
            }
            if (!$scope.common.user || !$scope.common.user.hasBeenWarnedAboutChangeBloqsToCode) {
                var modalCode = $rootScope.$new();
                _.extend(modalCode, {
                    contentTemplate: '/views/modals/alert.html',
                    text: 'code-modal_text_info',
                    cancelButton: true,
                    confirmText: 'code-modal_button_confirm',
                    confirmAction: goToCode,
                    cancelText: 'code-modal_button_reject',
                    rejectAction: goToBloq
                });
                ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container code-modal modal--alert',
                    scope: modalCode,
                    showClose: false
                });
            } else {
                if (projectService.project._id) {
                    $location.path('/codeproject/' + projectService.project._id);
                } else {
                    $scope.common.session.project = projectService.project;
                    $location.path('/codeproject/');
                }
            }
        };

        $scope.hideBloqsMenu = function($event) {
            if (!$event.target.className.match('btn--advanced') && !$event.target.className.match('level--2--shadow') && !$event.target.className.match('toolbox--bloqs--container')) {
                $scope.toolbox.level = 1;
            }
        };

        $scope.onFieldKeyDown = function(event) {
            if ((event.keyCode === 8) && $document[0].activeElement.attributes['data-bloq-id']) {
                event.preventDefault();
                var bloq = bloqs.bloqs[$document[0].activeElement.attributes['data-bloq-id'].value];
                if (bloq.bloqData.type !== 'group' && bloqs.bloqs[bloq.uuid].isConnectable()) {
                    bloqs.removeBloq($document[0].activeElement.attributes['data-bloq-id'].value, true);
                    $scope.$field.focus();
                    $scope.saveBloqStep();
                    projectService.startAutosave();
                } else {
                    $log.debug('we cant delete group bloqs');
                }
            }
        };

        $scope.onFieldKeyUp = function(event) {
            //$log.debug('event.keyCode', event.keyCode);
            var bloq;

            switch (event.keyCode) {
                case 46:
                case 8:
                    if ($document[0].activeElement.attributes['data-bloq-id']) {
                        event.preventDefault();
                        bloq = bloqs.bloqs[$document[0].activeElement.attributes['data-bloq-id'].value];
                        if (bloq.bloqData.type !== 'group' && bloqs.bloqs[bloq.uuid].isConnectable()) {
                            bloqs.removeBloq($document[0].activeElement.attributes['data-bloq-id'].value, true);
                            $scope.$field.focus();
                            $scope.saveBloqStep();
                            projectService.startAutosave();
                        } else {
                            $log.debug('we cant delete group bloqs');
                        }
                    }
                    break;
                case 67:
                    //$log.debug('ctrl + c');
                    if (event.ctrlKey && $document[0].activeElement.attributes['data-bloq-id']) {
                        bloq = bloqs.bloqs[$document[0].activeElement.attributes['data-bloq-id'].value];
                        var position = bloq.$bloq[0].getBoundingClientRect();
                        if (bloq.bloqData.type !== 'group') {
                            localStorage.bloqInClipboard = angular.toJson({
                                structure: bloq.getBloqsStructure(),
                                top: position.top,
                                left: position.left
                            });
                        }
                    }
                    break;
                case 86:
                    //$log.debug('ctrl + v');
                    if (event.ctrlKey && localStorage.bloqInClipboard) {
                        copyBloq(JSON.parse(localStorage.bloqInClipboard));
                    }
                    break;
                case 89:
                    $log.debug('ctrl + y');
                    if (event.ctrlKey) {
                        $scope.redo();
                        $window.document.getElementById('bloqs--field').focus();
                    }
                    break;
                case 90:
                    $log.debug('ctrl + z');
                    if (event.ctrlKey) {
                        $scope.undo();
                        $window.document.getElementById('bloqs--field').focus();
                    }
                    break;
            }
        };

        $scope.searchBloq = function() {
            var userComponents = _.pick(projectService.componentsArray, function(value) {
                return value.length > 0;
            });
            if (userComponents.indexOf($scope.searchText)) {
                //Todo pintar en un contenedor nuevo
            }
        };

        function existComponent(componentsToSearch, components) {
            var found,
                j,
                i = 0;

            while (!found && (i < componentsToSearch.length)) {
                j = 0;
                while (!found && (j < components.length)) {
                    if (componentsToSearch[i] === components[j].id) {
                        found = components[j];
                    }
                    j++;
                }
                i++;
            }

            return found;
        }

        $scope.showComponents = function(item) {
            var result = false;
            var stopWord = ['analogWrite', 'viewer', 'digitalWrite', 'pinReadAdvanced', 'pinWriteAdvanced', 'turnOnOffAdvanced', 'digitalReadAdvanced', 'analogReadAdvanced', 'pinLevels'];
            if (stopWord.indexOf(item) === -1) {
                var i;
                if (projectService.project.hardware.board && projectService.project.hardware.components) {
                    var connectedComponents = projectService.project.hardware.components;
                    if (item === 'hwVariable' && connectedComponents.length !== 0) {
                        result = true;
                    } else if (item === 'led') {
                        result = existComponent(['led'], connectedComponents);
                    } else if (item === 'readSensor') {
                        result = existComponent([
                            'us', 'button', 'limitswitch', 'encoder',
                            'sound', 'buttons', 'irs', 'irs2',
                            'joystick', 'ldrs', 'pot'
                        ], connectedComponents);
                    } else if (item.indexOf('serial') > -1) {
                        result = $scope.showCommunications(item);

                    } else if (item.includes('rgb')) {
                        result = existComponent(['RGBled'], connectedComponents);
                    } else if (item.includes('oscillator')) {
                        i = 0;
                        while (!result && (i < connectedComponents.length)) {
                            if ((connectedComponents[i].id === 'servo') && connectedComponents[i].oscillator && (connectedComponents[i].oscillator !== 'false')) {
                                result = true;
                            }
                            i++;
                        }
                    } else if (item.includes('continuousServo')) {
                        result = existComponent(['servocont'], connectedComponents);
                    } else if ((item === 'servoAttach') || (item === 'servoDetach')) {
                        result = existComponent(['servo', 'servocont'], connectedComponents);
                    } else if (item.includes('servo')) {
                        i = 0;
                        while (!result && (i < connectedComponents.length)) {
                            if ((connectedComponents[i].id === 'servo') && (connectedComponents[i].oscillator !== true)) {
                                result = true;
                            }
                            i++;
                        }
                    } else {
                        i = 0;
                        while (!result && (i < connectedComponents.length)) {
                            if (connectedComponents[i].id.includes(item) ||
                                item.toLowerCase().includes(connectedComponents[i].id)) {
                                result = true;
                            }
                            i++;
                        }
                    }
                }

            } else {
                result = true;
            }
            return result;
        };

        $scope.showCommunications = function(item) {
            var stopWord = ['convert'];
            if (projectService.componentsArray.serialElements) {
                return !(stopWord.indexOf(item) === -1 && projectService.componentsArray.serialElements.length === 0);
            } else {
                return false;
            }
        };

        $scope.enableBloqFromContextMenu = function(bloq) {
            bloq.enable();
            $scope.saveBloqStep();
            projectService.startAutosave();
        };
        $scope.disableBloqFromContextMenu = function(bloq) {
            bloq.disable();
            $scope.saveBloqStep();
            projectService.startAutosave();
        };
        $scope.removeBloqFromContextMenu = function(bloq) {
            bloqs.removeBloq(bloq.uuid, true);
            //saveBloqStep from here to not listen remove event from children and store one step for children
            $scope.saveBloqStep();
            projectService.startAutosave();
        };

        $scope.duplicateBloqFromContextMenu = function(bloq) {
            var position = bloq.$bloq[0].getBoundingClientRect();
            copyBloq({
                structure: bloq.getBloqsStructure(),
                top: position.top,
                left: position.left
            });
        };

        $scope.setSoftwareTab = function(tab) {
            $scope.softTab = tab;
            if (tab === 'code') {
                $scope.setCode(projectService.getCode());
            } else if (tab === 'bloqs') {
                $rootScope.$emit('currenttab:bloqstab');
            }
        };

        $scope.performFactoryReset = function() {
            var robot = projectService.project.hardware.robot,
                version = common.properties.robotsFirmwareVersion[robot];
            robotFirmwareApi.getFirmware(robot, version).then(function(result) {
                if (common.useChromeExtension()) {
                    web2boardOnline.upload({
                        hex: result.data,
                        board: {
                            mcu: 'uno'
                        }
                    });
                } else {
                    web2board.uploadHex('uno', result.data);
                }
            }, function() {
                // alert("Error"); todo: add toast
            });
        };

        function checkInputLength() {
            setScrollsDimension();
        }

        function clickDocumentHandler() {
            $contextMenu.css({
                display: 'none'
            });
        }

        function contextMenuDocumentHandler(event) {

            var bloq = $(event.target).closest('.bloq');
            var bloqUuid = bloq.attr('data-bloq-id');

            if (bloqUuid && !bloq.hasClass('bloq--group') && bloqs.bloqs[bloqUuid].isConnectable()) {
                event.preventDefault();
                $scope.$apply(function() {
                    $scope.contextMenuBloq = bloqs.bloqs[bloqUuid];
                });
                if ((angular.element($window).height() - event.pageY) > $contextMenu.height()) {
                    $contextMenu.css({
                        display: 'block',
                        left: event.pageX + 'px',
                        top: event.pageY + 'px'
                    });
                } else {
                    $contextMenu.css({
                        display: 'block',
                        left: event.pageX + 'px',
                        top: (event.pageY - $contextMenu.height()) + 'px'
                    });
                }

            } else {
                $contextMenu.css({
                    display: 'none'
                });
            }
        }

        function copyBloq(bloq) {

            var newBloq = bloqs.buildBloqWithContent(bloq.structure, projectService.componentsArray, bloqsApi.schemas);

            newBloq.doConnectable();
            newBloq.disable();

            newBloq.$bloq[0].style.transform = 'translate(' + (bloq.left - 50 + $scope.$field.scrollLeft()) + 'px,' + (bloq.top - 100 + $scope.$field.scrollTop()) + 'px)';
            $scope.$field.append(newBloq.$bloq);
            $scope.saveBloqStep();
            var i = 0;
            if (newBloq.varInputs) {
                for (i = 0; i < newBloq.varInputs.length; i++) {
                    newBloq.varInputs[i].keyup();
                }
            }
        }

        function goToCode() {
            ngDialog.closeAll();
            if ($scope.common.user) {
                $scope.common.user.hasBeenWarnedAboutChangeBloqsToCode = true;
                userApi.update({
                    hasBeenWarnedAboutChangeBloqsToCode: true
                });
                if (projectService.project._id) {
                    $location.path('/codeproject/' + projectService.project._id);
                } else {
                    $location.path('/codeproject/');
                }
            } else {
                $scope.common.session.project = projectService.project;
                $location.path('/codeproject/');
            }
        }

        function goToBloq() {
            ngDialog.closeAll();
            $scope.setSoftwareTab('bloqs');
        }

        function loadBloqs() {
            bloqsLoadTimes++;
            bloqsApi.itsLoaded().then(function() {
                    bloqs.setOptions({
                        fieldOffsetLeft: 70,
                        fieldOffsetRight: 216,
                        fieldOffsetTopSource: ['header', 'nav--make', 'actions--make', 'tabs--title'],
                        bloqSchemas: bloqsApi.schemas,
                        suggestionWindowParent: $scope.$field[0]
                    });
                    $scope.groupBloqs = angular.element('.field--content');
                    $scope.groupBloqs.on('scroll', scrollHorizontalField);
                    $scope.horizontalScrollBarContainer = angular.element('#make--horizontal-scrollbar');
                    $scope.horizontalScrollBarContainer.on('scroll', scrollHorizontalField);
                    $scope.horizontalScrollBar = angular.element('#scrollbar--horizontal-small');
                    $scope.common.isLoading = false;
                    $scope.init();
                    setScrollsDimension();
                    $('input[type="text"]').on('keyup paste change', checkInputLength);
                    bloqs.translateBloqs($translate.use());
                    $scope.$on('refresh-bloqs', function() {
                        $scope.init();
                        bloqs.destroyFreeBloqs();
                    });
                    $rootScope.$on('update-bloqs', function() {
                        $scope.init();
                        $scope.initFreeBloqs();
                    });
                    translateChangeStartEvent = $rootScope.$on('$translateChangeStart', function(evt, key) {
                        bloqs.translateBloqs(key.language);
                    });
                },
                function() {
                    $log.debug('fail');
                    if (bloqsLoadTimes < 2) {
                        loadBloqs();
                    } else {
                        alertsService.add({
                            text: 'make_infoError_bloqsLoadError',
                            id: 'loadBloqs',
                            type: 'warning'
                        });
                    }
                });
        }

        function scrollField(e) {
            scrollBar.css('height', e.currentTarget.scrollHeight);
            scrollBarContainer.scrollTo(0, e.currentTarget.scrollTop);
            field.scrollTo(0, scrollBarContainer[0].scrollTop);
        }

        function scrollHorizontalField(e) {
            if ($scope.lastPosition > e.currentTarget.scrollLeft) {
                angular.element('.field--content').scrollLeft(e.currentTarget.scrollLeft);
            } else {
                angular.element('.field--content').scrollLeft(e.currentTarget.scrollLeft + 150);
            }
            $scope.lastPosition = e.currentTarget.scrollLeft;
        }

        function setScrollsDimension() {
            if (!$scope.common.isLoading) {
                setScrollHeight();
                setScrollWidth();
            } else {
                $timeout(function() {
                    setScrollsDimension();
                }, 200);
            }
        }

        function setScrollHeight() {
            $timeout(function() {
                var realScrollbarHeight = bloqsTab.height() + 50;

                if ($scope.$field.height() < realScrollbarHeight) {
                    $scope.showScroll = true;
                    scrollBar.css('height', field[0].scrollHeight);
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                } else {
                    $scope.showScroll = false;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            }, 50);
        }

        function setScrollWidth() {
            $timeout(function() {
                var groupBloqs = angular.element('.field--content');
                var horizontalScrollBar = angular.element('#scrollbar--horizontal-small');
                var horizontalScrollWidth = Math.max.apply(null, groupBloqs.map(function() {
                    return this.scrollWidth;
                }));
                if (horizontalScrollWidth > groupBloqs[0].clientWidth) {
                    $scope.showHorizontalScroll = true;
                    horizontalScrollBar.css('width', horizontalScrollWidth + 50);
                } else {
                    $scope.showHorizontalScroll = false;
                }
            }, 50);
        }

        loadBloqs();

        $document.on('contextmenu', contextMenuDocumentHandler);
        $document.on('click', clickDocumentHandler);

        $window.onresize = function() {
            $timeout(function() {
                setScrollsDimension();
            }, 10);
        };

        var translateChangeStartEvent;
        var bloqsTabsEvent = $rootScope.$on('currenttab:bloqstab', function() {
            $timeout(function() {
                setScrollsDimension();
            }, 0);
        });
        $scope.$field.on('scroll', scrollField);
        scrollBarContainer.on('scroll', _.throttle(scrollField, 250));
        $window.addEventListener('bloqs:bloqremoved', _.throttle(setScrollsDimension, 250));
        $window.addEventListener('bloqs:dragend', _.throttle(setScrollsDimension, 1000));

        $scope.$on('$destroy', function() {
            $document.off('contextmenu', contextMenuDocumentHandler);
            $document.off('click', clickDocumentHandler);
            bloqsTabsEvent();
            translateChangeStartEvent();
        });
    });