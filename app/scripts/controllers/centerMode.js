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
        .controller('CenterCtrl', function($log, $scope, $rootScope, _, ngDialog, alertsService, centerModeApi, $routeParams) {
            /*$scope.teachers = [
             {
             _id: '1234',
             name: 'Pepito grillo',
             email: 'pepito@grillo.com',
             groups: '4',
             students: '32'
             }, ...
             */

            $scope.exercises = [
                {
                    name: 'Ejercicio lorem ipsum dolor sit amet consectetur',
                    endDate: '2016-10-19T12:13:14.774Z'
                }, {
                    name: '2.Ejercicio lorem ipsum dolor sit amet consectetur',
                    endDate: '2016-10-20T12:13:14.774Z'
                }
            ];

            $scope.teacher = {
                _id: '1234',
                name: 'Pepito grillo',
                email: 'pepito@grillo.com',
                groups: '4',
                students: '32'
            };


            $scope.groups = [
                {
                    _id: '1234',
                    name: 'Clase 3º B',
                    accessId: '2016-10-19T12:13:14.774Z',
                    students: '30'
                }, {
                    _id: '4567',
                    name: 'Asignatura de tecnología 3º',
                    accessId: '2016-10-20T12:13:14.774Z',
                    students: '30'
                }
            ];

            $scope.orderInstance = 'name';
            $scope.urlType = $routeParams.type;
            $scope.center = {};
            $scope.teachers = [];
            $scope.sortArray;
            $scope.secondaryBreadcrumb = false;


            $scope.sortInstances = function(type) {
                $log.debug('sortInstances', type);
                $scope.orderInstance = type;
            };

            $scope.newExercise = function() {

            };

            $scope.newGroup = function() {
                function confirmAction(name) {
                    var accessId = Date.now();
                    centerModeApi.createGroup(name, accessId).then(function() {
                        modalOptions.title = name;
                        modalOptions.mainText = 'centerMode_modal_accessIdInfo';
                        modalOptions.confirmButton = null;
                        modalOptions.rejectButton = 'close';
                        modalOptions.modalInput = false;
                        modalOptions.secondaryText = accessId;
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
                    scope: modalOptions,
                    showClose: false

                });
            };

            $scope.newTeacher = function() {
                var confirmAction = function() {
                        var teachers = _.pluck(modalOptions.newTeachersModel, 'text');
                        if (teachers.length > 0) {
                            centerModeApi.addTeachers(teachers, $scope.center._id).then(function() {
                                _getTeachers($scope.center._id);
                                alertsService.add({
                                    text: 'Success: add Teacher',
                                    id: 'addTeacher',
                                    type: 'ok',
                                    time: 5000
                                });
                            })
                                .catch(function() {
                                    alertsService.add({
                                        text: 'Error: add Teacher',
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
                    contentTemplate: '/views/modals/newTeacher.html',
                    modalButtons: true,
                    newTeachersModel: []
                });

                var newTeacherModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions,
                    showClose: false
                });
            };

            $scope.deleteTeacher = function(teacher) {
                var confirmAction = function() {
                        centerModeApi.deleteTeacher(teacher._id, $scope.center._id).then(function() {
                            _.remove($scope.teachers, teacher);
                            alertsService.add({
                                text: 'Success: delete Teacher',
                                id: 'deleteTeacher',
                                type: 'ok',
                                time: 5000
                            });
                        })
                            .catch(function() {
                                alertsService.add({
                                    text: 'Error: delete Teacher',
                                    id: 'deleteTeacher',
                                    type: 'error'
                                });
                            });
                        newTeacherModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new();

                _.extend(modalOptions, {
                    title: 'newTeacher_modal_title',
                    confirmButton: 'button_delete ',
                    rejectButton: 'cancel',
                    confirmAction: confirmAction,
                    contentTemplate: '/views/modals/information.html',
                    textContent: 'deleteTeacher_modal_information',
                    modalButtons: true
                });

                var newTeacherModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions,
                    showClose: false
                });
            };

            function _checkUrl() {
                $scope.urlType = $routeParams.type;
                switch ($scope.urlType) {
                    case 'center':
                        _getCenter();
                        break;
                    case 'center-teacher':
                    case 'teacher':
                        _getTeacher($routeParams.id);
                        break;


                }
            }

            function _getTeacher(teacherId) {
                centerModeApi.getTeacher(teacherId, $scope.center._id).then(function(response) {
                    console.log('chachi', response);
                    $scope.secondaryBreadcrumb = true;
                    $scope.teacher = _.extend($scope.teacher, response.data);
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
