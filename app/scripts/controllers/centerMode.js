(function() {
    'use strict';
    /**
     * @ngdoc function
     * @name bitbloqApp.controller:forumCtrl
     * @description
     * # forumCtrl
     * Controller of the bitbloqApp
     */
    angular.module('bitbloqApp')
        .controller('CenterCtrl', function forumCtrl($log, $scope, $rootScope, _, ngDialog, alertsService) {
            $scope.instance = [
                {
                    name: 'Pepito grillo',
                    email: 'pepito@grillo.com',
                    groups: '4',
                    students: '32'
                }, {
                    name: 'Caperucita roja',
                    email: 'caperucita@roja.com',
                    groups: '4',
                    students: '30'
                }, {
                    name: 'El principe azul',
                    email: 'el.principe@azul.com',
                    groups: '10',
                    students: '105'
                }
            ];

            $scope.sortArray = _.keys($scope.instance[0]);
            $scope.orderInstance = 'name';

            $scope.sortInstances = function(type) {
                $log.debug('sortInstances', type);
                $scope.orderInstance = type;
            };

            $scope.newTeacher = function() {
                var confirmAction = function() {
                        var teachers = _.pluck(modalOptions.newTeachersModel, 'text');
                        if (teachers.length > 0) {
                            centerModeApi.addTeachers(teachers).then(function() {
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
                        centerModeApi.deleteTeacher(teacher).then(function() {
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
        });
})();
