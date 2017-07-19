(function() {
    'use strict';
    /**
     * @ngdoc function
     * @name bitbloqApp.controller:ExercisesCtrl
     * @description
     * # ExercisesCtrl
     * Controller of the bitbloqApp
     */
    angular.module('bitbloqApp')
        .controller('ExercisesCtrl', function($log, $scope, $rootScope, _, ngDialog, alertsService, centerModeApi, exerciseApi, centerModeService, $routeParams, $location, commonModals, $window, exerciseService, $document, utils, $q) {
            $scope.exercises = [];
            $scope.menuActive = {};
            $scope.groups = [];
            $scope.pageno = 1;
            $scope.itemsPerPage = 10;
            $scope.filterExercisesParams = {};
            $scope.exercisesCount = 0;
            $scope.pagination = {
                'exercises': {
                    'current': 1
                }
            };
            $scope.groupArray = {};
            $scope.sortExercisesArray = ['centerMode_endDate', 'centerMode_initDate', 'exercises-sortby-created-recent', 'exercises-sortby-created-old', 'tasks-sortby-name-az', 'tasks-sortby-name-za'];
            $scope.exerciseService = exerciseService;
            $scope.centerModeService = centerModeService;

            var groupSelected;

            // option menu in exercise table
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

            // Assign groups
            $scope.editGroups = function(exercise) {
                centerModeApi.getGroupsByExercise(exercise._id).then(function(response) {
                    exerciseService.assignGroup(exercise, $scope.common.user._id, response.data).then(function() {
                        _getGroups();
                        _getExercises();
                    });
                });
            };

            $scope.createExerciseCopy = function(exercise) {
                exerciseService.clone(exercise);
                localStorage.exercisesChange = true;
            };

            $scope.deleteExercise = function(exercise) {
                var currentModal,
                    confirmAction = function() {
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

            $scope.getExercisesPaginated = function(pageno) {
                getTeacherExercisesPaginated(pageno, $scope.filterExercisesParams);
            };

            $scope.renameExercise = function(exercise) {
                commonModals.rename(exercise, 'exercise').then(function() {
                    exerciseApi.update(exercise._id, exercise);
                });
            };

            $scope.setMoreOptions = function() {
                $scope.showMoreActions = !$scope.showMoreActions;
            };

            $scope.common.isLoading = true;

            /**************************
             ***  PRIVATE FUNCTIONS ***
             **************************/

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

            function _checkUrl() {
                centerModeApi.getMyCenter().then(function(response) {
                    centerModeService.setCenter(response.data);
                    _getExercisesCount();
                    _getGroups();
                    _getExercises();
                });
            }

            function _getExercisesCount(searchText) {
                var searchParams = searchText ? searchText : ($routeParams.name ? {
                    'name': $routeParams.name
                } : '');
                centerModeApi.getExercisesCount(null, searchParams).then(function(response) {
                    $scope.exercisesCount = response.data.count;
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

            function _getGroups(exerciseId) {
                var defered = $q.defer();
                if (exerciseId) {
                    centerModeApi.getGroupsByExercise(exerciseId).then(function(response) {
                        $scope.groups = response.data;
                        $scope.groupArray = $scope.groups;
                        groupSelected = $scope.groups[0];
                        defered.resolve();
                    });
                } else {
                    centerModeApi.getGroups('teacher', null, centerModeService.center._id).then(function(response) {
                        $scope.groups = response.data;
                        $scope.groupArray = $scope.groups;
                        defered.resolve();
                    });
                }

                return defered.promise;
            }

            function getTeacherExercisesPaginated(pageno, search) {
                centerModeApi.getExercises(null, {
                    'page': pageno,
                    'pageSize': $scope.itemsPerPage,
                    'searchParams': search
                }).then(function(response) {
                    $scope.exercises = response.data;
                    _.forEach($scope.exercises, function(exercise) {
                        centerModeApi.getGroupsByExercise(exercise._id).then(function(response) {
                            exercise.groups = response.data;
                            var groups = _.map(response.data, 'name');
                            exercise.groups = groups.join(', ');
                        });
                    });
                    $location.search('page', pageno);
                }).finally(function() {
                    $scope.common.isLoading = false;
                });
            }

            /************************
             **  INIT && WATCHERS ***
             ************************/

            $window.onfocus = function() {
                $scope.$apply(function() {
                    $scope.timestamp = Date.now();
                });
                if (localStorage.exercisesChange && JSON.parse(localStorage.exercisesChange) && $scope.common.itsUserLoaded()) {
                    localStorage.exercisesChange = false;
                    _checkUrl();
                }
            };

            _init();
        });
})();
