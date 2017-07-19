(function() {
    'use strict';
    /**
     * @ngdoc function
     * @name bitbloqApp.controller:CenterCtrl
     * @description
     * # CenterCtrl
     * Controller of the bitbloqApp
     */
    angular.module('bitbloqApp')
        .controller('CenterCtrl', function($log, $scope, $rootScope, _, ngDialog, alertsService, centerModeApi, exerciseApi, centerModeService, $routeParams, $location, commonModals, $window) {
            $scope.sortArray = ['explore-sortby-recent', 'email', 'name', 'surname', 'centerMode_column_groups', 'centerMode_column_students'];
            $scope.secondaryBreadcrumb = false;
            $scope.orderInstance = 'name';
            $scope.centerModeService = centerModeService;
            $scope.selectedTab = 'teachers';
            $scope.activableRobots = [{
                    'uuid': 'mBot',
                    'image': 'mbot',
                    'link': 'https://www.makeblock.es/productos/robot_educativo_mbot/'
                },
                {
                    'uuid': 'mRanger',
                    'image': 'rangerlandraider',
                    'link': 'https://www.makeblock.es/productos/mbot_ranger/'
                },
                {
                    'uuid': 'starterKit',
                    'image': 'startertank',
                    'link': 'https://www.makeblock.es/productos/robot_starter_kit/'
                }
            ];

            $scope.centerActivateRobot = function(robot) {
                commonModals.activateRobot(robot, centerModeService.center._id).then(function(response) {
                    centerModeService.setCenter(response.data);
                });
            };

            $scope.deleteTeacher = function(teacher) {
                if (teacher.notConfirmed) {
                    centerModeApi.deleteInvitation(teacher._id, centerModeService.center._id).then(function() {
                        _.remove($scope.teachers, teacher);
                    });
                } else {
                    var confirmAction = function() {
                            centerModeApi.deleteTeacher(teacher._id, centerModeService.center._id).then(function() {
                                _.remove($scope.teachers, teacher);
                                alertsService.add({
                                    text: 'centerMode_alert_deleteTeacher',
                                    id: 'deleteTeacher',
                                    type: 'ok',
                                    time: 5000
                                });
                            }).catch(function() {
                                alertsService.add({
                                    text: 'centerMode_alert_deleteTeacher-Error',
                                    id: 'deleteTeacher',
                                    type: 'error'
                                });
                            });
                            teacherModal.close();
                        },
                        parent = $rootScope,
                        modalOptions = parent.$new();

                    _.extend(modalOptions, {
                        title: 'deleteTeacher_modal_title',
                        confirmButton: 'button_delete ',
                        rejectButton: 'cancel',
                        confirmAction: confirmAction,
                        contentTemplate: '/views/modals/information.html',
                        textContent: 'deleteTeacher_modal_information',
                        secondaryContent: 'deleteTeacher_modal_information-explain',
                        modalButtons: true
                    });

                    var teacherModal = ngDialog.open({
                        template: '/views/modals/modal.html',
                        className: 'modal--container modal--input',
                        scope: modalOptions
                    });
                }
            };

            $scope.sortInstances = function(type) {
                $log.debug('sortInstances', type);
                switch (type) {
                    case 'explore-sortby-recent':
                        $scope.orderInstance = 'createdAt';
                        $scope.reverseOrder = true;
                        break;
                    case 'email':
                        $scope.orderInstance = 'email';
                        $scope.reverseOrder = false;
                        break;
                    case 'name':
                        $scope.orderInstance = 'firstName';
                        $scope.reverseOrder = false;
                        break;
                    case 'surname':
                        $scope.orderInstance = 'lastName';
                        $scope.reverseOrder = false;
                        break;
                    case 'centerMode_column_groups':
                        $scope.orderInstance = 'groups';
                        $scope.reverseOrder = false;
                        break;
                    case 'centerMode_column_students':
                        $scope.orderInstance = 'students';
                        $scope.reverseOrder = false;
                        break;
                }
            };


            $scope.newTeacher = function() {
                var maxTeachers = centerModeService.center.maxTeachers ? centerModeService.center.maxTeachers : $scope.envData.config.maxTeachers;
                var confirmAction = function() {
                        var teachers = _.map(modalOptions.newTeachersModel, 'text');
                        var excedeedLimit = false;
                        if (teachers.length > 0) {
                            if (($scope.teachers.length + teachers.length) > maxTeachers) {
                                teachers = teachers.slice(0, maxTeachers - $scope.teachers.length);
                                excedeedLimit = true;
                            }
                            centerModeApi.addTeachers(teachers, centerModeService.center._id).then(function(response) {
                                if (response.data.teachersWithError) {
                                    commonModals.noAddTeachers(response.data.teachersWithError);
                                }
                                if (response.data.teachersWaitingConfirmation) {
                                    if (!excedeedLimit) {
                                        var alertText = response.data.teachersWaitingConfirmation.length === 1 ? 'centerMode_alert_sendInvitation' : 'centerMode_alert_sendInvitations';
                                        alertsService.add({
                                            text: alertText,
                                            id: 'addTeacher',
                                            type: 'info',
                                            value: response.data.teachersWaitingConfirmation.length,
                                            time: 5000
                                        });
                                    } else {
                                        var alertTextWithError = response.data.teachersWaitingConfirmation.length === 1 ? 'centerMode_alert_sendInvitation_with_error' : 'centerMode_alert_sendInvitations_with_error';
                                        alertsService.add({
                                            text: $scope.common.translate(alertTextWithError, {
                                                'value': response.data.teachersWaitingConfirmation.length,
                                                'maxTeachers': maxTeachers
                                            }),
                                            id: 'addTeacher',
                                            type: 'info',
                                            time: 5000
                                        });
                                    }
                                    _.forEach(response.data.teachersWaitingConfirmation, function(teacher) {
                                        teacher.notConfirmed = true;
                                        $scope.teachers.push(teacher);
                                    });
                                }
                            }).catch(function() {
                                alertsService.add({
                                    text: 'centerMode_alert_addTeacher-Error',
                                    id: 'addTeacher',
                                    type: 'error'
                                });
                            });
                        }
                        newTeacherModal.close();
                    },
                    closeAction = function() {
                        newTeacherModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new();

                modalOptions.center = centerModeService.center;
                _.extend(modalOptions, {
                    title: 'newTeacher_modal_title',
                    confirmButton: 'newTeacher_modal_aceptButton',
                    confirmAction: confirmAction,
                    rejectButton: 'cancel',
                    rejectAction: closeAction,
                    contentTemplate: '/views/modals/centerMode/newTeacher.html',
                    modalButtons: true,
                    newTeachersModel: []
                });

                if ($scope.teachers.length <= maxTeachers) {
                    var newTeacherModal = ngDialog.open({
                        template: '/views/modals/modal.html',
                        className: 'modal--container modal--input',
                        scope: modalOptions
                    });
                } else {
                    alertsService.add({
                        text: 'newTeacher_modal_numberlimit_toast',
                        id: 'addTeacher',
                        type: 'error',
                        value: maxTeachers
                    });
                }
            };

            $scope.resendInvitation = function(teacher) {
                centerModeApi.resendInvitation(teacher._id, centerModeService.center._id).then(function() {
                    alertsService.add({
                        text: 'centerMode_alert_sendInvitation',
                        id: 'addTeacher',
                        type: 'info',
                        time: 5000
                    });
                }).catch(function() {
                    alertsService.add({
                        text: 'centerMode_alert_addTeacher-Error',
                        id: 'addTeacher',
                        type: 'error'
                    });
                });
            };

            $scope.setTab = function(tab) {
                $scope.selectedTab = tab;
                _checkWatchers();
            };

            /****************************
             ******PRIVATE FUNCTIONS******
             *****************************/

            function _checkUrl() {
                _checkWatchers();
                _getCenter();
            }

            function _getCenter() {
                return centerModeApi.getMyCenter().then(function(response) {
                    centerModeService.setCenter(response.data);
                    _getTeachers(centerModeService.center._id);
                });
            }

            function _getTeachers(centerId) {
                centerModeApi.getTeachers(centerId).then(function(response) {
                    $scope.teachers = response.data;
                });
            }

            function _init() {
                $scope.common.itsUserLoaded().then(function() {
                    $scope.common.itsRoleLoaded().then(function() {
                        switch ($scope.common.userRole) {
                            case 'headmaster':
                                _checkUrl();
                                break;
                            default:
                                $location.path('/projects');
                        }
                    });
                }, function() {
                    $scope.common.setUser();
                    alertsService.add({
                        text: 'view-need-tobe-logged',
                        id: 'view-need-tobe-logged',
                        type: 'error'
                    });
                    $scope.common.goToLogin();
                });

            }

            function _checkWatchers() {
                if ($scope.selectedTab === 'info') {
                    centerModeService.addWatchers();
                } else {
                    centerModeService.unBlindAllWatchers();
                }
            }

            /*****************************
             *********** INIT ************
             *****************************/

            _init();
        });
})();
