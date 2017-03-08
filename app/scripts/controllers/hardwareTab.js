'use strict';
/**
 * @ngdoc function
 * @name bitbloqApp.controller:hardwareTabCtrl
 * @description
 * # hardwareTabCtrl
 * Controller of the components list
 */
angular.module('bitbloqApp')
    .controller('hardwareTabCtrl', hardwareTabCtrl);

function hardwareTabCtrl($rootScope, $scope, $document, $log, hw2Bloqs, alertsService, _, utils, $translate, $window, $timeout, bloqsUtils, hardwareConstants, userApi, projectService, commonModals) {

    var container = utils.getDOMElement('.protocanvas'),
        $componentContextMenu = $('#component-context-menu'),
        $boardContextMenu = $('#board-context-menu'),
        $robotContextMenu = $('#robot-context-menu'),
        $bTComponentContextMenu = $('#btcomponent-context-menu'),
        currentProjectService = $scope.currentProjectService || projectService;

    $scope.selectedToolbox = '';
    $scope.currentProject = $scope.currentProject || projectService.project;
    $scope.isEmptyComponentArray = currentProjectService.isEmptyComponentArray;
    $scope.daysLeft = null;

    $scope.changeToolbox = function(tab, event) {
        if (tab !== '') {
            $scope.$emit('menu--open');
        }
        if (event) {
            if (_.isEqual(event.target.classList, event.currentTarget.classList)) {
                $scope.selectedToolbox = tab;
            }
        } else {
            $scope.selectedToolbox = tab;
        }
    };

    $scope.closeComponentInteraction = function(pins, connectedPin) {
        if (!pins || !pins[Object.keys(connectedPin)[0]]) { //if !autoConnected
            $scope.firstComponent = false;
            if ($scope.common.user) {
                $scope.common.user.hasFirstComponent = true;
                userApi.update({
                    hasFirstComponent: true
                });
            }
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
    };

    $scope.langToBadge = {
        'ca-ES': 'ca',
        'de-De': 'de',
        'en-GB': 'en',
        'es-ES': 'es',
        'eu-ES': 'eu',
        'fr-FR': 'fr',
        'gl': 'gl',
        'it-IT': 'it',
        'pt-PT': 'pt'
    };
    $scope.translate = $translate;

    $scope.closeBluetoothInteraction = function(pins, connectedPin) {
        if (!pins || !pins[Object.keys(connectedPin)[0]]) { //if !autoConnected
            $scope.isMobileConnected = false;
            if ($scope.common.user) {
                $scope.common.user.isMobileConnected = true;
                userApi.update({
                    isMobileConnected: true
                });
            }
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
    };

    $scope.deleteBoard = function() {
        hw2Bloqs.removeBoard();
        $scope.boardSelected = false;
        $scope.currentProject.hardware.board = null;
        currentProjectService.startAutosave();
    };

    $scope.deleteRobot = function() {
        $scope.currentProject.hardware.showRobotImage = null;
        $scope.currentProject.hardware.robot = null;
        $scope.currentProject.hardware.board = null;
        currentProjectService.componentsArray.robot = [];
        $scope.robotSelected = false;
        currentProjectService.startAutosave();
    };

    $scope.detectElement = function(ev) {
        $scope.changeToolbox('');
        //If component, check it out if component has been moved
        if (ev.target.classList.contains('component')) {
            $scope.unsetInputFocus();
            var componentDOM = ev.target;
            var componentReference = currentProjectService.findComponentInComponentsArray(componentDOM.dataset.uid);

            var newCoordinates = {
                x: (componentDOM.offsetLeft / container.offsetWidth) * 100,
                y: (componentDOM.offsetTop / container.offsetHeight) * 100
            };
            if (!_.isEqual(newCoordinates, componentReference.coordinates) && componentReference.connected) {
                componentReference.coordinates = newCoordinates;
                currentProjectService.startAutosave();
            }
        } else if ($(ev.target).closest('.jsplumb-connector', container).length || $(ev.target)
            .closest('.board_ep', container).length || $(ev.target).closest('.component_ep', container).length) {
            $scope.componentSelected = null;
            $('.component').removeClass('component-selected');
        } else if (ev.target.classList.contains('robot')) {
            $scope.robotSelected = true;
        } else if (ev.target.classList.contains('board') || $(ev.target).closest('.board').length) {
            $scope.boardSelected = true;

            //Unselect selected components
            $scope.componentSelected = null;
            $('.component').removeClass('component-selected');
            hw2Bloqs.unselectAllConnections();

            if ($scope.currentProject.hardware.board) {
                $scope.changeToolbox('components');
            } else {
                $scope.changeToolbox('boards');
            }
        } else if (ev.target.classList.contains('component__container')) {
            if (!$scope.currentProject.hardware.robot) {
                if (!$scope.currentProject.hardware.board) {
                    $scope.changeToolbox('boards');
                } else if ($scope.currentProject.hardware.board && currentProjectService.isEmptyComponentArray()) {
                    $scope.changeToolbox('components');
                }
            }

        } else if (ev.target.classList.contains('oscillator--checkbox')) {
            $scope.unsetInputFocus();
        } else if ($(ev.target).closest('.baudrate__dropdown').length) {
            $scope.unsetInputFocus();
            ev.preventDefault();
        } else if (ev.target.classList.contains('component-name__input')) {
            $scope.setInputFocus();
        } else if ($(ev.target).closest('.component-name__container').length) {
            $scope.unsetInputFocus();
        } else if (ev.target.classList.contains('bitbloqconnect-icon')) {
            $scope.inputFocus = false;
            hw2Bloqs.unselectAllConnections();
            $scope.robotSelected = $scope.boardSelected = false;
            $('.component').removeClass('component-selected');
            if ($scope.currentProject.bitbloqConnectBT) {
                $scope.componentSelected = $scope.currentProject.bitbloqConnectBT;
            }
        } else {
            $scope.robotSelected = $scope.boardSelected = $scope.componentSelected = false;
            $('.component').removeClass('component-selected');
            hw2Bloqs.unselectAllConnections();
        }
    };

    $scope.duplicateComponent = function() {
        if (!$scope.componentSelected) {
            throw Error('componentSelected undefined');
        }
        var newComponent = _.cloneDeep($scope.componentSelected);
        delete newComponent.endpoints;
        delete newComponent.pin;
        delete newComponent.uid;
        newComponent.connected = false;
        $scope.currentProject.hardware.components.push(newComponent);

        var coordinates = {
            x: newComponent.coordinates.x > 85 ? 85 + 3 : newComponent.coordinates.x + 3,
            y: newComponent.coordinates.y > 85 ? 85 + 3 : newComponent.coordinates.y + 3,
        };
        newComponent.coordinates = coordinates;
        newComponent.name = _createUniqueVarName(newComponent); //Generate unique name

        currentProjectService.addComponentInComponentsArray(newComponent.category, newComponent);

        var componentDOM = hw2Bloqs.addComponent(newComponent);
        if (!$scope.$$phase) {
            $scope.$digest();
        }
        _focusComponent(componentDOM);
        hw2Bloqs.unselectAllConnections();

    };

    $scope.disconnectComponent = function(component) {
        hw2Bloqs.disconnectComponent(component || $scope.componentSelected);
        $scope.componentSelected.connected = false;
        currentProjectService.startAutosave();
        _closeContextMenu();
    };

    $scope.disconnectAllComponents = function() {
        hw2Bloqs.disconnectAllComponents();
        $scope.currentProject.hardware.components.forEach(function(comp) {
            comp.connected = false;
        });
        currentProjectService.startAutosave();
        _closeContextMenu();
    };

    $scope.deleteComponent = function() {
        $scope.disconnectComponent();
        var category = $scope.componentSelected.oscillator ? 'oscillators' : $scope.componentSelected.category,
            c = _.remove(currentProjectService.componentsArray[category], currentProjectService.findComponentInComponentsArray($scope.componentSelected.uid)),
            componentToRemove = $('[data-uid="' + c[0].uid + '"]')[0];
        $scope.componentSelected = false;
        hw2Bloqs.removeComponent(componentToRemove);
        currentProjectService.startAutosave();
    };

    $scope.hardware.cleanSchema = function() {
        hw2Bloqs.removeAllComponents();
        currentProjectService.setComponentsArray(bloqsUtils.getEmptyComponentsArray());
        $scope.deleteBoard();
        currentProjectService.startAutosave();
    };

    $scope.hardware.sortToolbox = function() {
        $log.log('sortToolbox');

        var filteredList;
        if ($scope.currentProject.hardware.robot) {
            filteredList = [];

        } else if ($scope.currentProject.hardware.board && $scope.boardsMap[$scope.currentProject.hardware.board].availableComponents) {
            filteredList = _.filter(hardwareConstants.components, function(component) {
                return $scope.boardsMap[$scope.currentProject.hardware.board].availableComponents.indexOf(component.id) !== -1;
            });
        } else {
            filteredList = _.filter(hardwareConstants.components, {
                manufacter: 'standard'
            });
        }

        var translatedList = _.each(filteredList, function(item) {
            item.name = $translate.instant(item.id);
        });

        $scope.hardware.componentSortered = _.sortBy(translatedList, 'name');
    };
    $scope.drop = function(data) {
        hw2Bloqs.userInteraction = true;
        switch (data.type) {
            case 'boards':
                $scope.daysLeft = null;
                var board = _.find($scope.hardware.boardList, function(board) {
                    return board.id === data.id;
                });
                _addBoard(board);
                $scope.changeToolbox('components');
                break;
            case 'components':
                if (!$scope.currentProject.hardware.board) {
                    $scope.changeToolbox('boards');
                    alertsService.add({
                        text: 'bloqs-project_alert_no-board',
                        id: 'error_noboard',
                        type: 'error'
                    });
                    return false;
                } else if ($scope.currentProject.hardware.robot) {
                    alertsService.add({
                        text: 'bloqs-project_alert_only-robot',
                        id: 'error_noboard',
                        type: 'error'
                    });
                    return false;
                }
                _addComponent(data);
                break;
            case 'robots':
                $scope.daysLeft = null;
                var robotFamily = $scope.robotsMap[data.id].family;
                var thirdPartyRobots = $scope.common.user.thirdPartyRobots;
                $scope.hardware.cleanSchema();
                $scope.deleteBTComponent();
                _addRobot(data);
                if (robotFamily && (!thirdPartyRobots || !thirdPartyRobots[robotFamily])) {
                    $scope.showActivationModal(false, robotFamily);
                } else {
                    var endDate = thirdPartyRobots[robotFamily].expirationDate;
                    $scope.daysLeft = endDate ? getDaysleft(endDate) : null;
                }
                break;
            case 'btComponent':
                $scope.daysLeft = null;
                if (!$scope.currentProject.hardware.board) {
                    $scope.subMenuHandler('boards', 'open', 1);
                    alertsService.add({
                        text: 'bloqs-project_alert_no-board',
                        id: 'error_noboard',
                        type: 'error'
                    });
                } else if ($scope.currentProject.hardware.robot) {
                    alertsService.add({
                        text: 'bloqs-project_alert_only-robot',
                        id: 'error_noboard',
                        type: 'error'
                    });
                } else {
                    _addBtComponent(data);
                }
                break;
        }

    };

    function getDaysleft(expirationDate) {
        return parseInt(moment(expirationDate).diff(moment(), 'days'));
    }

    $scope.showActivationModal = function(trialUsed, robotFamily) {
        var robotModal = robotFamily ? robotFamily : $scope.robotsMap[$scope.currentProject.hardware.showRobotImage].family;
        commonModals.activateRobot(robotModal, trialUsed).then(function(res) {
            if (res === 'activate') {
                $scope.daysLeft = null;
                projectService.startAutosave(true);
            } else if (res === 'trial') {
                $scope.daysLeft = 2;
            }
        });
    };

    $scope.closeActivationWarning = function() {
        $scope.daysLeft = null;
    };

    function _addBtComponent() {
        if (!$scope.currentProject.useBitbloqConnect) {
            $scope.currentProject.useBitbloqConnect = true;
            if ($scope.currentProject.hardware.board === 'bq ZUM') {
                //added on get code too
                var bTComponent = _.cloneDeep(_.find(hardwareConstants.components.serialElements, {
                    id: 'bt'
                }));
                bTComponent.name = $scope.common.translate('device').toLowerCase() + '_0';
                bTComponent.baudRate = 19200;
                bTComponent.category = 'serialElements';
                bTComponent.pin = {
                    rx: 0,
                    tx: 1
                };
                bTComponent.uid = 'btComponent';
                currentProjectService.addComponentInComponentsArray('serialElements', bTComponent);
                $scope.currentProject.bitbloqConnectBT = bTComponent;
            } else {
                $scope.currentProject.bitbloqConnectBT = {
                    message: $scope.common.translate('device-needs-bluetooth')
                };

                var btConnected = _.find(currentProjectService.componentsArray.serialElements, function(component) {
                    return component.id === 'bt';
                });
                if (!btConnected) {
                    $scope.isMobileConnected = true;
                }
            }

        }
        currentProjectService.startAutosave();
    }

    $scope.deleteBTComponent = function() {
        $scope.currentProject.useBitbloqConnect = false;
        $scope.componentSelected = false;
        if (projectService.project.bitbloqConnectBT && projectService.project.bitbloqConnectBT.name) {
            currentProjectService.removeComponentInComponentsArray('serialElements', $scope.currentProject.bitbloqConnectBT.name);
        }
        $scope.currentProject.bitbloqConnectBT = null;
    };

    $scope.setBaudRate = function(baudRate) {
        $scope.componentSelected.baudRate = baudRate;
        currentProjectService.startAutosave();
    };

    $scope.setInputFocus = function() {
        $scope.inputFocus = true;
    };

    $scope.unsetInputFocus = function() {
        $scope.inputFocus = false;
        container.focus();
    };

    $scope.checkName = function() {
        var componentsNames = [];
        _.forEach(currentProjectService.componentsArray, function(category) {
            if (category.length > 0) {
                category.forEach(function(comp) {
                    componentsNames.push(comp.name);
                });
            }

        });

        if (_.uniq(componentsNames).length !== componentsNames.length) {
            $scope.componentSelected.name += '_copy';
        }
        var nameFixed = _validName($scope.componentSelected.name);
        nameFixed = utils.removeDiacritics(nameFixed);
        if (nameFixed !== $scope.componentSelected.name) {
            $scope.componentSelected.name = nameFixed;
        }
        if ($scope.componentSelected.connected || $scope.componentSelected.uid === 'btComponent') {
            currentProjectService.startAutosave();
        }
    };

    /***************************************
     * Private functions
     ****************************************/

    function _initialize() {
        $scope.robotsMap = _getRobotsMap(hardwareConstants);
        $scope.boardsMap = _getBoardsMap(hardwareConstants);
        $scope.componentsMap = _getComponentsMap(hardwareConstants);

        $scope.hardware.boardList = hardwareConstants.boards;
        $scope.hardware.robotList = hardwareConstants.robots;
        $scope.hwBasicsLoaded.resolve();
        $scope.hardware.sortToolbox();

        hw2Bloqs.initialize(container, 'boardSchema', 'robotSchema');

        container.addEventListener('mousedown', _mouseDownHandler, true);

        $document.on('contextmenu', _contextMenuDocumentHandler);
        $document.on('click', _clickDocumentHandler);

        container.addEventListener('connectionEvent', connectionEventHandler);
    }

    function _getRobotsMap(hardwareConstants) {
        var map = {};
        for (var i = 0; i < hardwareConstants.robots.length; i++) {
            map[hardwareConstants.robots[i].id] = hardwareConstants.robots[i];
        }
        return map;
    }

    function _getBoardsMap(hardwareConstants) {
        var map = {};
        for (var i = 0; i < hardwareConstants.boards.length; i++) {
            map[hardwareConstants.boards[i].id] = hardwareConstants.boards[i];
        }
        return map;
    }

    function _getComponentsMap(hardwareConstants) {
        var map = {};
        for (var i = 0; i < hardwareConstants.components.length; i++) {
            map[hardwareConstants.components[i].id] = hardwareConstants.components[i];
        }
        return map;
    }

    function _mouseDownHandler(e) {
        if (e.target.classList.contains('component')) {
            _focusComponent(e.target);
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        }
    }

    function _closeContextMenu() {
        $('.hw-context-menu').css({
            display: 'none'
        });
    }

    function _contextMenuDocumentHandler(ev) {
        if (ev.target.classList.contains('component')) {
            if ((angular.element($window).height() - event.pageY) > $componentContextMenu.height()) {
                $componentContextMenu.css({
                    display: 'block',
                    left: event.pageX + 'px',
                    top: event.pageY + 'px'
                });
            } else {
                $componentContextMenu.css({
                    display: 'block',
                    left: event.pageX + 'px',
                    top: (event.pageY - $componentContextMenu.height()) + 'px'
                });
            }
            _focusComponent(ev.target);
        } else if (ev.target.classList.contains('board') || $(ev.target).closest('.board').length) {
            if ($scope.currentProject.hardware.board) {
                $boardContextMenu.css({
                    display: 'block',
                    left: event.pageX + 'px',
                    top: event.pageY + 'px'
                });
            }
        } else if (ev.target.classList.contains('robot')) {
            $robotContextMenu.css({
                display: 'block',
                left: event.pageX + 'px',
                top: event.pageY + 'px'
            });
        } else if (ev.target.classList.contains('bitbloqconnect-icon')) {
            $bTComponentContextMenu.css({
                display: 'block',
                left: event.pageX + 'px',
                top: event.pageY + 'px'
            });
        } else {
            _closeContextMenu();
        }

        ev.preventDefault();
        return false;
    }

    function _clickDocumentHandler() {
        _closeContextMenu();
    }

    function checkComponentConnections(componentUid) {
        var component = currentProjectService.findComponentInComponentsArray(componentUid);
        var connections = 0;
        if (component) {
            _.forEach(component.pin, function(value) {
                if (!_.isNull(value) && !_.isUndefined(value)) {
                    connections++;
                }
            });
        }
        if (connections === 0) {
            component.connected = false;
        }
    }

    function connectionEventHandler(e) {
        var componentReference, pinKey;
        /* HW Connection listeners */

        function _detectConnected(pins) {
            var filtered = _.filter(pins, function(pin) {
                return pin !== undefined;
            });
            return filtered.length > 0;
        }

        componentReference = currentProjectService.findComponentInComponentsArray(e.componentData.uid);
        $scope.closeComponentInteraction(componentReference.pin, e.componentData.pin);
        if (($scope.isMobileConnected || $scope.isMobileConnected === undefined) && componentReference.id === 'bt') {
            $scope.closeBluetoothInteraction(componentReference.pin, e.componentData.pin);
        }

        if (componentReference) {
            if (e.protoBoLaAction === 'attach') {
                pinKey = Object.keys(e.componentData.pin)[0];
                if (componentReference.pin.hasOwnProperty(pinKey)) {
                    componentReference.pin[pinKey] = e.componentData.pin[pinKey];
                }

                $rootScope.$emit('component-connected');

                if (hw2Bloqs.userInteraction) {
                    if (_itsABoardWithProblemsInFirstPins($scope.currentProject.hardware.board) && _.findKey(componentReference.pin, function(o) {
                            return o === '1' || o === '0';
                        })) {
                        alertsService.add({
                            text: 'connect_alert_01',
                            id: 'connect-error',
                            type: 'warning',
                        });
                    }
                }

            } else if (e.protoBoLaAction === 'detach') {
                hw2Bloqs.userInteraction = true;
                pinKey = Object.keys(e.componentData.pin)[0];
                if (componentReference.pin.hasOwnProperty(pinKey)) {
                    componentReference.pin[pinKey] = undefined;
                }

            }

            if (_detectConnected(componentReference.pin)) {
                componentReference.connected = true;
            } else {
                componentReference.connected = false;
            }

            if ($scope.currentProjectLoaded.promise.$$state.status === 1 && projectComponentsHaveChanged(currentProjectService.componentsArray)) {
                currentProjectService.startAutosave();
            }

        } else {
            $log.debug('Unable to find this component or component is already removed');
        }
    }

    function _itsABoardWithProblemsInFirstPins(board) {
        var result;
        switch (board) {
            case 'bqZUM':
            case 'FreaduinoUNO':
            case 'ArduinoUNO':
            case 'ArduinoMEGA2560':
                result = true;
                break;
            default:
                result = false;
        }
        return result;
    }

    function projectComponentsHaveChanged(newComponentsJSON) {
        var components = _.flattenDeep(_.filter(newComponentsJSON, function(item) {
            return item.length > 0;
        }));
        return !_.isEqual(_.sortBy($scope.currentProject.hardware.components, 'name'), _.sortBy(components, 'name'));
    }

    function _addIntegratedComponents(board) {
        if (board.integratedComponents) {
            var tempComponent;
            for (var i = 0; i < board.integratedComponents.length; i++) {
                tempComponent = _.clone($scope.componentsMap[board.integratedComponents[i].id], true);
                _.extend(tempComponent, board.integratedComponents[i]);

                tempComponent.name = $scope.common.translate(board.integratedComponents[i].name);
                tempComponent.integratedComponent = true;
                $scope.currentProject.hardware.components.push(tempComponent);
                projectService.addComponentInComponentsArray(tempComponent.category, tempComponent);
            }
        }
    }

    function _addBoard(board) {
        if ($scope.currentProject.hardware.board !== board.id || $scope.currentProject.hardware.robot) {
            $scope.deleteRobot();

            $scope.currentProject.hardware.showRobotImage = null;

            hw2Bloqs.addBoard(board);

            $scope.currentProject.hardware.board = board.id;

            if (hw2Bloqs.checkIfOldConnections && $scope.currentProject.hardware.components > 0 || $scope.currentProject.useBitbloqConnect) {
                $scope.deleteBTComponent();
                _addBtComponent();
            }
            $scope.hardware.sortToolbox();
            _addIntegratedComponents(board);

            currentProjectService.startAutosave();
        } else {
            $log.debug('same board');
        }
    }

    function _addRobot(robot) {

        var robotReference = _.find($scope.hardware.robotList, function(r) {
            return r.id === robot.id;
        });
        hw2Bloqs.removeRobot(robotReference);

        if (robotReference.useBoardImage) {
            var board = _.find($scope.hardware.boardList, function(board) {
                return board.id === robotReference.board;
            });
            _addBoard(board);
            $scope.currentProject.hardware.showRobotImage = robot.id;
            $scope.changeToolbox('components');
        } else {
            $scope.currentProject.hardware.robot = robot.id;
            $scope.currentProject.hardware.showRobotImage = null;

            hw2Bloqs.addRobot(robotReference);
            $scope.currentProject.hardware.board = robotReference.board;

            $scope.componentSelected = null;
            $scope.hardware.sortToolbox();
            currentProjectService.setComponentsArray();
            currentProjectService.startAutosave();
        }

    }

    function _addComponent(data) {
        var component = $scope.componentsMap[data.id];

        if (!component.pin || !component.pin[Object.keys(component.pin)[0]]) { // if !autoConnected
            $scope.firstComponent = ($scope.firstComponent === undefined || ($scope.common.user && $scope.common.user.hasFirstComponent)) ? true : $scope.firstComponent;
            if ($scope.currentProject.useBitbloqConnect && data.id === 'bt') {
                $scope.isMobileConnected = !($scope.isMobileConnected === undefined || ($scope.common.user && $scope.common.user.isMobileConnected)) ? true : $scope.isMobileConnected;
            }
        }
        var boardMetadata = currentProjectService.getBoardMetaData();

        var newComponent = _.cloneDeep(component);

        if (newComponent.id === 'device' || newComponent.id === 'bt') {
            switch (boardMetadata.id) {
                case 'bqZUM':
                    newComponent.baudRate = 19200;
                    break;
                case 'FreaduinoUNO':
                    newComponent.baudRate = 38400;
                    break;
                case 'ArduinoUNO':
                    newComponent.baudRate = 38400;
                    break;
            }
        }
        currentProjectService.addComponentInComponentsArray(data.category, newComponent);

        var relativeCoordinates = {
            x: ((data.coordinates.x / container.clientWidth) * 100),
            y: ((data.coordinates.y / container.clientHeight) * 100)
        };

        newComponent.coordinates = relativeCoordinates;
        newComponent.category = data.category;
        newComponent.name = _createUniqueVarName(newComponent); //Generate unique name
        newComponent.connected = false;

        hw2Bloqs.unselectAllConnections();
        var componentDOMRef = hw2Bloqs.addComponent(newComponent);
        _focusComponent(componentDOMRef);
        $scope.boardSelected = false;
    }

    function _focusComponent(component) {

        $('.component').removeClass('component-selected');

        var componentSelected = currentProjectService.findComponentInComponentsArray(component.dataset.uid);
        $(component).addClass('component-selected');

        container.focus();

        $scope.componentSelected = componentSelected;
        $scope.boardSelected = false;

        $log.debug('focusComponent', $scope.componentSelected);

    }

    $scope.hasDownloadedApp = function() {
        if ($scope.common.user) {
            userApi.update({
                hasDownloadedApp: true
            });
        }
    };

    function _createUniqueVarName(component) {
        var componentBasicName = $translate.instant('default-var-name-' + component.id),
            componentsNames = [];

        if (component.uid === 'btComponent') {
            componentBasicName = $scope.common.translate('device').toLowerCase();
        }

        if (component.category) {
            currentProjectService.componentsArray[component.category].forEach(function(comp) {
                componentsNames[comp.name] = true;
            });
        }

        var j = 0,
            finalName = null;
        while (!finalName) {
            if (!componentsNames[componentBasicName + '_' + j]) {
                finalName = componentBasicName + '_' + j;
            }
            j++;
        }
        return finalName;
    }

    function _removeElementFromKeyboard(focusedElement) {
        if (focusedElement.classList.contains('bitbloqconnect-icon')) {
            $scope.deleteBTComponent(focusedElement);
        } else if ($scope.componentSelected) {
            $scope.deleteComponent();
            $scope.componentSelected = false;
        } else if ($scope.boardSelected) {
            $scope.deleteBoard();
        } else if ($scope.robotSelected) {
            $scope.deleteRobot();
        } else { //No component or board selected
            var componentUid = hw2Bloqs.removeSelectedConnection();
            checkComponentConnections(componentUid);
        }
    }

    function _loadHardwareProject(hardwareProject) {
        hw2Bloqs.userInteraction = false;
        if (hardwareProject.anonymousTransient) {
            delete hardwareProject.anonymousTransient;
        }

        var hwSchema = {},
            conectableComponents = _.filter($scope.currentProject.hardware.components, function(item) {
                return !item.integratedComponent;
            });
        hwSchema.components = _.cloneDeep(conectableComponents);
        hwSchema.connections = _.cloneDeep($scope.currentProject.hardware.connections);

        $scope.hwBasicsLoaded.promise.then(function() {
            if ($scope.currentProject.hardware.robot) {
                var robotReference = currentProjectService.getRobotMetaData();
                hwSchema.robot = robotReference; //The whole board object is passed
            } else if ($scope.currentProject.hardware.board) {
                var boardReference = currentProjectService.getBoardMetaData();
                var showRobotImage = $scope.currentProject.hardware.showRobotImage;
                if ($scope.common.user && showRobotImage) {
                    var endDate = $scope.common.user.thirdPartyRobots[$scope.robotsMap[showRobotImage].family].expirationDate;
                    $scope.daysLeft = endDate ? getDaysleft(endDate) : null;
                }
                hwSchema.board = boardReference; //The whole board object is passed
            }

            if (hwSchema.robot || hwSchema.board) {
                hw2Bloqs.loadSchema(hwSchema);
                hw2Bloqs.repaint();
                $scope.hardware.firstLoad = false;
                //Fix components dimensions
                _.forEach(conectableComponents, function(item) {
                    item = bloqsUtils.checkPins(item);
                    _fixComponentsDimension(item);
                });

                $scope.hardware.sortToolbox();
            } else {
                $log.debug('robot is undefined');
            }

        });
    }

    function _fixComponentsDimension(compRef) {
        var c = _.find(hardwareConstants.components, {
            'id': compRef.id
        });
        var componentDOM = document.querySelector('[data-uid="' + compRef.uid + '"]');
        componentDOM.style.width = c.width + 'px';
        componentDOM.style.height = c.height + 'px';
    }

    function _validName(name) {
        var reservedWords = 'setup,loop,if,else,for,switch,case,while,do,break,continue,return,goto,define,include,HIGH,LOW,INPUT,OUTPUT,INPUT_PULLUP,true,false,interger, constants,floating,point,void,bool,char,unsigned,byte,int,word,long,float,double,string,String,array,static, volatile,const,sizeof,pinMode,digitalWrite,digitalRead,analogReference,analogRead,analogWrite,tone,noTone,shiftOut,shitIn,pulseIn,millis,micros,delay,delayMicroseconds,min,max,abs,constrain,map,pow,sqrt,sin,cos,tan,randomSeed,random,lowByte,highByte,bitRead,bitWrite,bitSet,bitClear,bit,attachInterrupt,detachInterrupt,interrupts,noInterrupts';
        reservedWords = reservedWords.split(',');
        if (name && name.length > 0) {
            var i = 0,
                j = 0;
            while (i < name.length) {
                if (!isNaN(parseFloat(name[i]))) {
                    name = name.substring(1, name.length);
                } else {
                    break;
                }
            }
            //Remove all accents
            name = name.replace(/([áàâä])/g, 'a').replace(/([éèêë])/g, 'e').replace(/([íìîï])/g, 'i')
                .replace(/([óòôö])/g, 'o').replace(/([úùûü])/g, 'u');
            name = name.replace(/([ÁÀÂÄ])/g, 'A').replace(/([ÉÈÊË])/g, 'E').replace(/([ÍÌÎÏ])/g, 'I')
                .replace(/([ÓÒÔÖ])/g, 'O').replace(/([ÚÙÛÜ])/g, 'U');
            //Remove spaces and ñ
            name = name.replace(/([ ])/g, '_')
                .replace(/([ñ])/g, 'n');
            //Remove all symbols
            name = name.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&\Ç\%\=\~\{\}\¿\¡\"\@\:\;\-\"\·\|\º\ª\¨\'\·\̣\─\ç\`\´\¨\^])/g, '');
            i = 0;
            while (i < name.length) {
                if (!isNaN(parseFloat(name[i]))) {
                    name = name.substring(1, name.length);
                } else {
                    break;
                }
            }
            for (j = 0; j < reservedWords.length; j++) {
                if (name === reservedWords[j]) {
                    name += '_';
                    break;
                }
            }
        }
        return name;
    }

    function _getClonComponent() {
        $scope.hardware.clonComponent = $scope.componentSelected;
    }

    function _setClonComponent() {
        if ($scope.hardware.clonComponent) {
            $scope.duplicateComponent();
            $scope.hardware.clonComponent = $scope.componentSelected;
        }
    }

    /*************************************************
     Shortcuts
     *************************************************/
    $scope.onKeyPress = function($event) {

        switch ($event.keyCode) {

            case 67:
                //ctrl+c
                if ($event.ctrlKey) {
                    if ($scope.inputFocus) {
                        return false;
                    }
                    _getClonComponent();
                    $event.preventDefault();
                }
                break;
            case 86:
                //ctrl+v
                if ($event.ctrlKey) {
                    if ($scope.inputFocus) {
                        return false;
                    }
                    _setClonComponent();
                    $event.preventDefault();
                }
                break;
                // case 90:
                //     //ctr+z
                //     if ($event.ctrlKey) {
                //         $scope.undo();
                //         $event.preventDefault();
                //     }
                //     break;
                // case 89:
                //     //ctr+y
                //     if ($event.ctrlKey) {
                //         $scope.redo();
                //         $event.preventDefault();
                //     }
                //     break;
            case 8:
                //backspace
                if ($scope.inputFocus) {
                    return false;
                }
                _removeElementFromKeyboard($event.target);
                $event.preventDefault();
                break;
            case 46:
                //Supr
                if ($scope.inputFocus) {
                    return false;
                }
                _removeElementFromKeyboard($event.target);
                $event.preventDefault();
                break;
        }
    };

    // toolbox filter components
    $scope.searchText = '';
    $scope.filterSearch = function(criteria) {
        return function(item) {
            if (criteria === '') {
                return false;
            }
            var translatedNameNormalized = utils.removeDiacritics($translate.instant(item.id), {
                spaces: false
            }).toLowerCase();
            var criteriaNormalized = utils.removeDiacritics(criteria, {
                spaces: false
            }).toLowerCase();
            return translatedNameNormalized.indexOf(criteriaNormalized) > -1;
        };
    };
    /* Initialize jsplumb */
    _initialize();

    $scope.baudRates = ['300', '1200', '2400', '4800', '9600', '14400', '19200', '28800', '38400', '57600', '115200'];
    $scope.componentSelected = null;
    $scope.inputFocus = false;

    $scope.offsetTop = ['header', 'nav--make', 'actions--make', 'tabs--title'];
    $scope.firstComponent = undefined;
    $scope.isMobileConnected = undefined;

    $scope.$watch('componentSelected.oscillator', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            var index;
            if (newVal && (newVal !== 'false')) {
                index = currentProjectService.componentsArray.servos.indexOf($scope.componentSelected);
                if (index > -1) {
                    currentProjectService.componentsArray.servos.splice(index, 1);
                    currentProjectService.componentsArray.oscillators.push($scope.componentSelected);
                }

            } else {
                index = currentProjectService.componentsArray.oscillators.indexOf($scope.componentSelected);
                if (index > -1) {
                    currentProjectService.componentsArray.oscillators.splice(index, 1);
                    currentProjectService.componentsArray.servos.push($scope.componentSelected);
                }
            }
            currentProjectService.startAutosave();
        }
    });

    $scope.$watch('componentSelected.name', function(newVal, oldVal) {
        if (oldVal === '' && newVal !== '') {
            $timeout.cancel($scope.timeoutCode);
            currentProjectService.startAutosave();
        } else {
            if (newVal && oldVal && (newVal !== oldVal)) {
                $scope.checkName();
            } else if (newVal === '') {
                $timeout.cancel($scope.timeoutCode);
                $scope.timeoutCode = $timeout(function() {
                    $scope.componentSelected.name = _createUniqueVarName($scope.componentSelected);
                    currentProjectService.startAutosave();
                }, 3000);
            }
        }
    });

    $scope.$on('$destroy', function() {
        container.removeEventListener('connectionEvent', connectionEventHandler);
        container.removeEventListener('mousedown', _mouseDownHandler);
        $document.off('contextmenu', _contextMenuDocumentHandler);
        $document.off('click', _clickDocumentHandler);
        $scope.initHardwarePromise();
        drawHardwareEvent();
        translateChangeEndEvent();
    });

    var translateChangeEndEvent = $rootScope.$on('$translateChangeEnd', function() {
        $scope.hardware.sortToolbox();
    });

    var drawHardwareEvent = $rootScope.$on('drawHardware', function() {
        if ($scope.currentProject.hardware.board || $scope.currentProject.hardware.robot) {
            _loadHardwareProject($scope.currentProject.hardware);
        }
        $scope.hardware.firstLoad = true;
    });

}