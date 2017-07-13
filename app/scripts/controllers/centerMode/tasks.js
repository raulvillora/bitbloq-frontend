(function() {
    'use strict';
    /**
     * @ngdoc function
     * @name bitbloqApp.controller:TasksCtrl
     * @description
     * # TasksCtrl
     * Controller of the bitbloqApp
     */
        //QUE NO LLAMEIS TAREAS A LOS EJERCICIOS DE UN ALUMNO
        //QUE NO LLAMEIS TAREAS A LOS EJERCICIOS DE UN ALUMNO
        //QUE NO LLAMEIS TAREAS A LOS EJERCICIOS DE UN ALUMNO
        //by Jose
    angular.module('bitbloqApp')
        .controller('TasksCtrl', function($log, $scope, $rootScope, _, ngDialog, alertsService, centerModeApi, exerciseApi, centerModeService, $routeParams, $location, commonModals, $window, exerciseService, $document, utils, $timeout, $translate) {
            $scope.tasks = [];
            $scope.pageno = 1;
            $scope.exercisesCount = 0;
            $scope.itemsPerPage = 10;
            $scope.menuActive = {};
            $scope.pagination = {
                'tasks': {
                    'current': 1
                }
            };
            $scope.exerciseService = exerciseService;
            $scope.centerModeService = centerModeService;

            var currentModal;

            $scope.changeExerciseMenu = function(index) {
                var previousState;
                if ($scope.menuActive[index]) {
                    previousState = $scope.menuActive[index];
                } else {
                    previousState = false;
                }
                $scope.menuActive = {};
                $scope.menuActive[index] = !previousState;
            };

            $scope.getTasksPaginated = function(pageno) {
                exerciseApi.getTasksByExercise($scope.exercise._id, {
                    'page': pageno,
                    'pageSize': $scope.itemsPerPage
                }).then(function(response) {
                    response.data.forEach(function(task) {
                        var taskId = task._id;
                        _.extend(task, task.student);
                        if (task.status === 'pending' && exerciseService.getDatetime(task.endDate, true)) {
                            task.status = 'notDelivered';
                        }
                        task._id = taskId;
                    });
                    $scope.tasks = response.data;
                    $location.search('page', pageno);
                });
            };

            $scope.registerInGroup = function() {
                function confirmAction(accessId) {
                    centerModeApi.registerInGroup(accessId).then(function() {
                        currentModal.close();
                        _getGroups('student');
                        _getTasks();
                    }).catch(function() {
                        modal.input.showError = true;
                    });
                }

                var modalOptions = $rootScope.$new(),
                    modal = _.extend(modalOptions, {
                        title: 'centerMode_modal_registerInGroupTitle',
                        contentTemplate: 'views/modals/input.html',
                        mainText: 'centerMode_modal_registerInGroupInfo',
                        modalInput: true,
                        secondaryText: false,
                        input: {
                            id: 'groupId',
                            name: 'groupId',
                            placeholder: 'centerMode_modal_groupIdPlaceholder',
                            errorText: 'centerMode_modal_registerInGroup-error',
                            showError: false
                        },
                        confirmButton: 'centerMode_button_registerInGroup',
                        condition: function() {
                            return this.input.value;
                        },
                        rejectButton: 'modal-button-cancel',
                        confirmAction: confirmAction,
                        modalButtons: true
                    });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input modal--register-in-group',
                    scope: modalOptions

                });
            };

            function _init() {
                $scope.common.itsUserLoaded().then(function() {
                    centerModeService.setCenter();
                    _getGroups('student');
                    _getMyExercises();
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

            function _getMyExercisesCount() {
                exerciseApi.getTasksCount().then(function(response) {
                    $scope.exercisesCount = response.data.count;
                });
            }

            function _getMyExercises() {
                _getMyExercisesCount();
                if ($routeParams.page) {
                    _getTasksWithParams($routeParams.page);
                    $scope.pagination.tasks.current = $routeParams.page;
                } else {
                    _getTasksWithParams($scope.pageno);
                }
            }

            function _getGroups() {
                centerModeApi.getGroups('student').then(function(response) {
                    $scope.groups = response.data;
                    $scope.groupArray = $scope.groups;
                });
            }

            function _getTasks(groupId, studentId, pageno) {
                exerciseApi.getTasks(groupId, studentId, {
                    'page': pageno,
                    'pageSize': $scope.itemsPerPage
                }).then(function(response) {
                    var exercises = response.data;
                    exercises.tasks.forEach(function(task) {
                        if (task.status === 'pending' && exerciseService.getDatetime(task.endDate, true)) {
                            task.status = 'notDelivered';
                        }
                    });
                    $scope.tertiaryBreadcrumb = true;
                    $scope.tasks = response.data.tasks;
                    $scope.group = response.data.group;
                    $scope.student = response.data.student;
                });
            }

            function _getTasksWithParams(pageno) {
                exerciseApi.getTasks(null, null, {
                    'page': pageno,
                    'pageSize': $scope.itemsPerPage
                }).then(function(response) {
                    response.data.forEach(function(task) {
                        if (task.status === 'pending' && exerciseService.getDatetime(task.endDate, true)) {
                            task.status = 'notDelivered';
                        }
                    });
                    $scope.tasks = response.data;
                    $location.search('page', pageno);
                });
            }

            _init();

            $scope.$watch('search.searchExercisesText', function(newValue, oldValue) {
                if (newValue !== oldValue && (oldValue || oldValue === '') || (!oldValue && newValue)) {
                    if (newValue || newValue === '') {
                        $scope.filterExercisesParams.name = newValue;
                        if (newValue === '') {
                            $scope.filterExercisesParams = {};
                            $location.search('name', null);
                            $location.search('page', 1);
                        }
                        $scope.searchExercises();
                    } else {
                        delete $scope.filterExercisesParams.name;
                    }
                }
            });
        });
})();