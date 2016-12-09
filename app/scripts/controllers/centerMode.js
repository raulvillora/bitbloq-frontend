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
        .controller('CenterCtrl', function($log, $scope, $rootScope, _, ngDialog, alertsService, centerModeApi, $routeParams, $location) {

            $scope.exercises = [
                {
                    name: 'Ejercicio lorem ipsum dolor sit amet consectetur',
                    endDate: '2016-10-19T12:13:14.774Z'
                }, {
                    name: '2.Ejercicio lorem ipsum dolor sit amet consectetur',
                    endDate: '2016-10-20T12:13:14.774Z'
                }
            ];

            $scope.center = {};
            $scope.group = {};
            $scope.groups = [];
            $scope.teacher = {};
            $scope.teachers = [];
            $scope.secondaryBreadcrumb = false;
            $scope.sortArray = [];
            $scope.students = [];
            $scope.orderInstance = 'name';
            $scope.common.urlType = $routeParams.type;

            var currentModal;

            $scope.changeStatusClass = function() {
                centerModeApi.updateGroup($scope.group).catch(function() {
                    alertsService.add({
                        text: 'updateGroup_alert_Error',
                        id: 'deleteGroup',
                        type: 'ko'
                    });
                });
            };

            $scope.closeGroup = function() {
                var parent = $rootScope,
                    modalOptions = parent.$new();
                _.extend(modalOptions, {
                    title: 'closeGroup_modal_title',
                    confirmButton: 'closeGroup_modal_acceptButton',
                    confirmAction: _closeGroupAction,
                    rejectButton: 'modal-button-cancel',
                    textContent: 'closeGroup_modal_info',
                    contentTemplate: '/views/modals/information.html',
                    modalButtons: true
                });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.deleteGroup = function() {
                var confirmAction = function() {
                        centerModeApi.deleteGroup($scope.group._id).then(function() {
                            alertsService.add({
                                text: 'centerMode_alert_deleteGroup',
                                id: 'deleteGroup',
                                type: 'ok',
                                time: 5000
                            });
                            $location.url('center-mode/teacher');
                        }).catch(function() {
                            alertsService.add({
                                text: 'centerMode_alert_deleteGroup-Error',
                                id: 'deleteGroup',
                                type: 'ko'
                            });
                        });
                        currentModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new();
                _.extend(modalOptions, {
                    title: 'deleteGroup_modal_title',
                    confirmButton: 'deleteGroup_modal_acceptButton',
                    confirmAction: confirmAction,
                    rejectButton: 'modal-button-cancel',
                    contentTemplate: '/views/modals/centerMode/deleteGroup.html',
                    finishAction: _closeGroupAction,
                    modalButtons: true
                });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.deleteTeacher = function(teacher) {
                var confirmAction = function() {
                        centerModeApi.deleteTeacher(teacher._id, $scope.center._id).then(function() {
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
                        newTeacherModal.close();
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

                var newTeacherModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.sortInstances = function(type) {
                $log.debug('sortInstances', type);
                $scope.orderInstance = type;
            };

            $scope.newGroup = function() {
                function confirmAction(name) {
                    var accessId = Date.now();
                    centerModeApi.createGroup(name, accessId, $scope.teacher._id, $scope.center._id).then(function() {
                        modalOptions.title = name;
                        modalOptions.mainText = 'centerMode_modal_accessIdInfo';
                        modalOptions.confirmButton = null;
                        modalOptions.rejectButton = 'close';
                        modalOptions.modalInput = false;
                        modalOptions.secondaryText = accessId;
                        _getGroups();
                    });
                }

                var modalOptions = $rootScope.$new();

                _.extend(modalOptions, {
                    title: 'centerMode_modal_createGroupTitle',
                    contentTemplate: 'views/modals/input.html',
                    mainText: 'centerMode_modal_createGroupInfo',
                    modalInput: true,
                    secondaryText: false,
                    input: {
                        id: 'groupName',
                        name: 'groupName',
                        placeholder: 'centerMode_modal_createGroupPlaceholder'
                    },
                    confirmButton: 'centerMode_button_createGroup',
                    rejectButton: 'modal-button-cancel',
                    confirmAction: confirmAction,
                    modalButtons: true
                });

                ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions

                });
            };

            $scope.newTeacher = function() {
                var confirmAction = function() {
                        var teachers = _.pluck(modalOptions.newTeachersModel, 'text');
                        if (teachers.length > 0) {
                            centerModeApi.addTeachers(teachers, $scope.center._id).then(function() {
                                _getTeachers($scope.center._id);
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
                    parent = $rootScope,
                    modalOptions = parent.$new();

                _.extend(modalOptions, {
                    title: 'newTeacher_modal_title',
                    confirmButton: 'newTeacher_modal_aceptButton',
                    confirmAction: confirmAction,
                    contentTemplate: '/views/modals/centerMode/newTeacher.html',
                    modalButtons: true,
                    newTeachersModel: []
                });

                var newTeacherModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.registerInGroup = function() {
                function confirmAction(groupId) {
                    centerModeApi.registerInGroup(groupId).then(function() {
                        currentModal.close();
                        _getGroups();
                    });
                }

                var modalOptions = $rootScope.$new();

                _.extend(modalOptions, {
                    title: 'centerMode_modal_registerInGroupTitle',
                    contentTemplate: 'views/modals/input.html',
                    mainText: 'centerMode_modal_registerInGroupInfo',
                    modalInput: true,
                    secondaryText: false,
                    input: {
                        id: 'groupId',
                        name: 'groupId',
                        placeholder: 'centerMode_modal_groupIdPlaceholder'
                    },
                    confirmButton: 'centerMode_button_registerInGroup',
                    rejectButton: 'modal-button-cancel',
                    confirmAction: confirmAction,
                    modalButtons: true
                });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions

                });
            };

            function _checkUrl() {
                $scope.common.urlType = $routeParams.type;
                switch ($scope.common.urlType) {
                    case 'center':
                        _getCenter();
                        break;
                    case 'center-teacher':
                    case 'teacher':
                        _getTeacher($routeParams.id);
                        break;
                    case 'group':
                        _getGroup($routeParams.id);
                        break;
                    case 'student':
                        _getGroups();
                        break;
                }
            }

            function _closeGroupAction() {
                $scope.classStateCheck = false;
                $scope.group.status = 'closed';
                centerModeApi.updateGroup($scope.group).then(function() {
                    alertsService.add({
                        text: 'centerMode_alert_closeGroup',
                        id: 'closeGroup',
                        type: 'ok',
                        time: 5000
                    });
                }).catch(function() {
                    alertsService.add({
                        text: 'centerMode_alert_closeGroup-Error',
                        id: 'closeGroup',
                        type: 'ko'
                    });
                });
                currentModal.close();
            }

            function _getGroup(groupId) {
                centerModeApi.getGroup(groupId).then(function(response) {
                    $scope.secondaryBreadcrumb = true;
                    $scope.group = response.data;
                    $scope.classStateCheck = $scope.group.status === 'open';
                });
            }

            function _getGroups() {
                centerModeApi.getGroups($scope.teacher._id).then(function(response) {
                    $scope.groups = response.data;
                });
            }

            function _getTeacher(teacherId) {
                teacherId = teacherId || $scope.common.user._id;
                centerModeApi.getTeacher(teacherId, $scope.center._id).then(function(response) {
                    $scope.secondaryBreadcrumb = true;
                    $scope.teacher = _.extend($scope.teacher, response.data);
                    _getGroups();
                });
            }

            function _getTeachers(centerId) {
                centerModeApi.getTeachers(centerId).then(function(response) {
                    $scope.teachers = response.data;
                    $scope.sortArray = _.keys($scope.teachers[0]);
                });
            }

            function _getCenter() {
                centerModeApi.getMyCenter().then(function(response) {
                    $scope.center = response.data;
                    _getTeachers($scope.center._id);
                });

            }

            $scope.common.itsUserLoaded().then(function() {
                centerModeApi.getMyCenter().then(function(response) { //todo delete
                    $scope.center = response.data;
                    _checkUrl();
                });
            });
        });
})();
