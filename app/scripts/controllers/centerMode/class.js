(function() {
    'use strict';
    /**
     * @ngdoc function
     * @name bitbloqApp.controller:ClassCtrl
     * @description
     * # ClassCtrl
     * Controller of the bitbloqApp
     */
    angular.module('bitbloqApp')
        .controller('ClassCtrl', function($log, $scope, $rootScope, _, ngDialog, alertsService, centerModeApi, exerciseApi, centerModeService, $routeParams, $location, commonModals, $window, exerciseService, $document, utils, $timeout, $translate) {

            $scope.moment = moment;
            $scope.exercises = [];
            $scope.group = {};
            $scope.groups = [];
            $scope.sortArray = ['explore-sortby-recent', 'email', 'name', 'surname', 'centerMode_column_groups', 'centerMode_column_students'];
            $scope.classesStatusArray = [];
            $scope.secondaryBreadcrumb = false;
            $scope.students = [];
            $scope.studentsJSON = [];
            $scope.orderInstance = 'name';
            $scope.urlSubType = $routeParams.child;
            $scope.showMoreActionsInClass = false;
            $scope.pageno = 1;
            $scope.classesArray = [];
            $scope.showFilters = false;
            $scope.exercisesCount = 0;
            $scope.itemsPerPage = 10;
            $scope.menuActive = {};
            $scope.search = {};
            $scope.filterExercisesParams = {};
            $scope.pagination = {
                'exercises': {
                    'current': 1
                },
                'tasks': {
                    'current': 1
                }
            };
            $scope.groupArray = {};
            $scope.exerciseService = exerciseService;
            $scope.centerModeService = centerModeService;
            $scope.colorPickerFlag = {};

            var currentModal;

            $scope.editGroups = function(exercise) {
                centerModeApi.getGroupsByExercise(exercise._id).then(function(response) {
                    exerciseService.assignGroup(exercise, $scope.common.user._id, response.data).then(function() {
                        _getGroups();
                        _getExercises();
                    });
                });
            };

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

            $scope.changeStatusClass = function() {
                centerModeApi.updateGroup($scope.group).catch(function() {
                    alertsService.add({
                        text: 'updateGroup_alert_Error',
                        id: 'deleteGroup',
                        type: 'ko'
                    });
                });
            };

            $scope.changeGroupColor = function() {
                centerModeApi.updateGroup($scope.group).then(function() {
                    $scope.colorPickerFlag.open = false;
                });
            };

            $scope.closeGroup = function() {
                var parent = $rootScope,
                    modalOptions = parent.$new();
                _.extend(modalOptions, {
                    title: 'closeGroup_modal_title',
                    confirmButton: 'archiveGroup_modal_acceptButton',
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

            $scope.createExerciseCopy = function(exercise) {
                exerciseService.clone(exercise);
                localStorage.exercisesChange = true;
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
                            $location.path('classes');
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
                    confirmButton: 'button_delete',
                    confirmAction: confirmAction,
                    rejectButton: 'modal-button-cancel',
                    contentTemplate: '/views/modals/centerMode/deleteGroup.html',
                    finishAction: $scope.closeGroup,
                    modalButtons: true
                });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input modal--delete-group',
                    scope: modalOptions
                });
            };

            $scope.deleteTask = function(task) {
                var confirmAction = function() {
                        exerciseApi.deleteTask(task._id).then(function() {
                            _.remove($scope.tasks, task);
                            alertsService.add({
                                text: 'centerMode_alert_deleteTask',
                                id: 'deleteTask',
                                type: 'ok',
                                time: 5000
                            });
                        }).catch(function() {
                            alertsService.add({
                                text: 'centerMode_alert_deleteTask-error',
                                id: 'deleteTask',
                                type: 'ko'
                            });
                        });
                        currentModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new(),
                    student = $scope.student && $scope.student.firstName ? $scope.student.firstName + $scope.student.lastName : $scope.student.username;
                _.extend(modalOptions, {
                    title: $scope.common.translate('deleteTask_modal_title') + ': ' + task.name,
                    confirmButton: 'button_delete',
                    value: $scope.student.username,
                    confirmAction: confirmAction,
                    rejectButton: 'modal-button-cancel',
                    contentTemplate: '/views/modals/information.html',
                    textContent: $scope.common.translate('deleteTask_modal_information', {
                        value: student
                    }),
                    secondaryContent: 'deleteTask_modal_information-explain',
                    modalButtons: true
                });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.deleteExerciseInGroup = function(exerciseId) {
                centerModeApi.unassignExerciseInGroup(exerciseId, $scope.group._id).then(function() {
                    _.remove($scope.exercises, function(n) {
                        return n._id === exerciseId;
                    });
                });

            };

            $scope.deleteExercise = function(exercise) {
                var confirmAction = function() {
                        var exerciseId;
                        if (exercise.exercise) {
                            exerciseId = exercise.exercise._id;
                        } else {
                            exerciseId = exercise._id;
                        }
                        exerciseApi.delete(exerciseId).then(function() {
                            _.remove($scope.exercises, exercise);
                            alertsService.add({
                                text: 'centerMode_alert_deleteExercise',
                                id: 'deleteTask',
                                type: 'ok',
                                time: 5000
                            });
                        }).catch(function() {
                            alertsService.add({
                                text: 'centerMode_alert_deleteExercise-error',
                                id: 'deleteTask',
                                type: 'ko'
                            });
                        });
                        currentModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new();
                _.extend(modalOptions, {
                    title: $scope.common.translate('deleteExercise_modal_title') + ': ' + exercise.name,
                    confirmButton: 'button_delete',
                    confirmAction: confirmAction,
                    rejectButton: 'modal-button-cancel',
                    contentTemplate: '/views/modals/information.html',
                    textContent: $scope.common.translate('deleteExercise_modal_information'),
                    secondaryContent: 'deleteExercise_modal_information-explain',
                    modalButtons: true
                });

                currentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.deleteStudent = function(student) {
                var confirmAction = function() {
                        centerModeApi.deleteStudent(student._id, $scope.group._id).then(function() {
                            alertsService.add({
                                text: 'centerMode_alert_deleteStudent',
                                id: 'deleteStudent',
                                type: 'ok',
                                time: 5000
                            });
                            $location.path('class/' + $scope.group._id);
                        }).catch(function() {
                            alertsService.add({
                                text: 'centerMode_alert_deleteStudent-error',
                                id: 'deleteTStudent',
                                type: 'error'
                            });
                        });
                        studentModal.close();
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new(),
                    studentName = $scope.student && $scope.student.firstName ? $scope.student.firstName + $scope.student.lastName : $scope.student.username;

                _.extend(modalOptions, {
                    title: 'deleteStudent_modal_title',
                    confirmButton: 'button_delete ',
                    rejectButton: 'cancel',
                    confirmAction: confirmAction,
                    contentTemplate: '/views/modals/information.html',
                    textContent: $scope.common.translate('deleteStudent_modal_information', {
                        value: studentName
                    }),
                    secondaryContent: 'deleteStudent_modal_information-explain',
                    modalButtons: true
                });

                var studentModal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            };

            $scope.getExercisesPaginated = function(pageno) {
                getTeacherExercisesPaginated(pageno, $scope.filterExercisesParams);
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

            $scope.renameExercise = function(exercise) {
                commonModals.rename(exercise, 'exercise').then(function() {
                    exerciseApi.update(exercise._id, exercise);
                });
            };

            $scope.saveUrl = function(newUrl) {
                $scope.common.lastUrl = $location.url();
                $location.url(newUrl);
            };

            $scope.setMoreOptionsInClass = function() {
                $scope.showMoreActionsInClass = !$scope.showMoreActionsInClass;
            };

            $scope.searchExercises = function() {
                $location.search($scope.filterExercisesParams);
                getTeacherExercisesPaginated($scope.pageno, $scope.filterExercisesParams);
                _getExercisesCount($scope.filterExercisesParams);
            };

            $scope.setTab = function(tab) {
                $scope.selectedTab = tab;
            };

            $scope.getCsvHeaders = function() {
                var translations = $scope.common.translate(['surname', 'name', 'centerMode_column_averageMark', 'email', 'user-name']),
                    headers = [];

                _.forEach(translations, function(element) {
                    headers.push(element);
                });

                return headers;
            };

            /**************************
             ***  PRIVATE FUNCTIONS ***
             **************************/

            function _checkUrl() {
                if ($scope.urlSubType && $scope.urlSubType === 'student') {
                    _getTasks($routeParams.id, $routeParams.studentId);
                } else {
                    _getGroup($routeParams.id);
                }
            }

            function getTeacherExercisesPaginated(pageno, search) {
                centerModeApi.getExercises($scope.common.user._id, {
                    'page': pageno,
                    'pageSize': $scope.itemsPerPage,
                    'searchParams': search ? search : {}
                }).then(function(response) {
                    $scope.exercises = response.data;
                    $location.search('page', pageno);
                });
            }

            function _closeGroupAction() {
                $scope.classStateCheck = false;
                $scope.group.status = 'closed';
                $scope.group.color = '#c0c3c9';
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

            function _getExercisesCount(searchText) {
                var searchParams = searchText ? searchText : ($routeParams.name ? {
                    'name': $routeParams.name
                } : '');
                centerModeApi.getExercisesCount($scope.common.user._id, searchParams).then(function(response) {
                    $scope.exercisesCount = response.data.count;
                });
            }

            function _getGroup(groupId) {
                centerModeApi.getGroup(groupId).then(function(response) {
                    $scope.secondaryBreadcrumb = true;
                    $scope.group = response.data;
                    $scope.students = $scope.group.students;
                    $scope.exercises = $scope.group.exercises;
                    $scope.classStateCheck = $scope.group.status === 'open';
                    _.forEach($scope.students, function(student) {
                        $scope.studentsJSON.push(_.pick(student, 'lastName', 'firstName', 'averageMark', 'email', 'username'));
                    });
                });
            }

            function _getGroups() {
                centerModeApi.getMyCentersAsTeacher().then(function(response) {
                    centerModeService.setCenters(response.data);
                    $scope.centersArray = [];
                    _.forEach(centerModeService.centers, function(center) {
                        $scope.centersArray.push(_.pick(center, ['_id', 'name']));
                    });
                    $scope.getCenterGroups(centerModeService.center._id ? centerModeService.center : $scope.centersArray[0]);
                });
            }

            function _getTasks(groupId, studentId, pageno) {
                exerciseApi.getTasks(groupId, studentId, {
                    'page': pageno,
                    'pageSize': $scope.itemsPerPage
                }).then(function(response) {
                    $scope.exercises = response.data;
                    if ($scope.urlSubType === 'student') {
                        $scope.exercises.tasks.forEach(function(task) {
                            if (task.status === 'pending' && exerciseService.getDatetime(task.endDate, true)) {
                                task.status = 'notDelivered';
                            }
                        });
                        $scope.tertiaryBreadcrumb = true;
                        $scope.tasks = response.data.tasks;
                        $scope.group = response.data.group;
                        $scope.student = response.data.student;
                    }
                });
            }

            function _getExercises() {
                var searchParams;
                searchParams = $routeParams.name ? $routeParams.name : '';
                if (searchParams) {
                    $scope.showFilters = true;
                    $scope.search.searchExercisesText = searchParams;
                }
                if ($routeParams.page) {
                    getTeacherExercisesPaginated($routeParams.page, {
                        'name': searchParams
                    });
                    $scope.pagination.exercises.current = $routeParams.page;
                } else {
                    getTeacherExercisesPaginated($scope.pageno);
                }
            }

            function _init() {
                $scope.common.itsUserLoaded().then(function() {
                    $scope.common.itsRoleLoaded().then(function() {
                        switch ($scope.common.userRole) {
                            case 'headmaster':
                            case 'teacher':
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

            /************************
             **  INIT && WATCHERS ***
             ************************/

            _init();

        });
})();
