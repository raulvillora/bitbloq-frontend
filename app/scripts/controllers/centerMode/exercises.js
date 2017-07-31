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
            $scope.groupArray = [{
                'name': 'all-classes'
            }];
            $scope.sortExercisesArray = ['centerMode_endDate', 'centerMode_initDate', 'exercises-sortby-created-recent', 'exercises-sortby-created-old', 'tasks-sortby-name-az', 'tasks-sortby-name-za'];
            $scope.exerciseStatusArray = ['filter-by-all', 'filter-by-open-tasks', 'filter-by-closed-tasks', 'filter-by-undefined-tasks'];
            $scope.exerciseService = exerciseService;
            $scope.centerModeService = centerModeService;
            $scope.moment = moment;
            $scope.search = {};

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
                if (exercise._id) {
                    centerModeApi.getGroupsByExercise(exercise._id).then(function(response) {
                        exerciseService.assignGroup(exercise, $scope.common.user._id, response.data).then(function() {
                            _getGroups();
                            _getExercises();
                        });
                    });
                } else {
                    exerciseService.assignGroup(exercise, $scope.common.user._id, []).then(function() {
                        _getGroups();
                        _getExercises();
                    });
                }
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
                console.log('este¿??¿¿¿¿');

                getTeacherExercisesPaginated(pageno);
            };

            $scope.renameExercise = function(exercise) {
                commonModals.rename(exercise, 'exercise').then(function() {
                    exerciseApi.update(exercise._id, exercise);
                });
            };

            $scope.setMoreOptions = function() {
                $scope.showMoreActions = !$scope.showMoreActions;
            };

            $scope.filterByClass = function(c) {
                $scope.classFilter = c._id ? c._id : undefined;
                getTeacherExercisesPaginated($scope.pageno);
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
                    _getGroups();
                    _getExercises();
                });
            }

            function _getExercises() {
                if ($routeParams.page) {
                    getTeacherExercisesPaginated($routeParams.page);
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
                        $scope.groupArray = $scope.groupArray.concat($scope.groups);
                        groupSelected = $scope.groups[0];
                        defered.resolve();
                    });
                } else {
                    centerModeApi.getGroups('teacher', null, null).then(function(response) {
                        $scope.groups = response.data;
                        $scope.groupArray = $scope.groupArray.concat($scope.groups);
                        defered.resolve();
                    });
                }

                return defered.promise;
            }

            function getTeacherExercisesPaginated(pageno) {
                var queryParamsArray = getRequest(),
                    queryParams = queryParamsArray || {},
                    exercisePage = pageno ? pageno : 1;

                var pageParams = {
                    'page': exercisePage
                };

                angular.extend(queryParams, pageParams);

                if (!$scope.classFilter) {
                    centerModeApi.getExercises(null, queryParams).then(function(response) {
                        $scope.exercises = response.data.exercises;
                        $scope.exercisesCount = response.data.count;
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
                } else {
                    centerModeApi.getExercisesByGroup($scope.classFilter, queryParams).then(function(response) {
                        $scope.exercises = response.data.exercises;
                        $scope.exercisesCount = response.data.count;
                        _.forEach($scope.exercises, function(exercise) {
                            centerModeApi.getGroupsByExercise(exercise._id).then(function(response) {
                                exercise.groups = response.data;
                                var groups = _.map(response.data, 'name');
                                exercise.groups = groups.join(', ');
                            });
                        });
                        $location.search({
                            'class': $scope.classFilter,
                            'status': queryParams.status,
                            'name': queryParams.name ? queryParams.name.$regex : '',
                            'page': exercisePage,
                        });

                    });
                }
            }

            function getRequest() {
                var queryParams = {
                        'query': {}
                    },
                    sortParams = getSortRequest(),
                    statusParams = getStatusRequest(),
                    searchParams = getSearchRequest();

                angular.extend(queryParams, sortParams);
                angular.extend(queryParams, statusParams);
                angular.extend(queryParams, searchParams);

                return queryParams;
            }

            function getSearchRequest(queryParams) {
                queryParams = queryParams || {};
                if ($scope.search.searchExercisesText) {
                    queryParams = {
                        search: {
                            $regex: $scope.search.searchExercisesText,
                            $options: 'i'
                        }
                    };
                }
                return queryParams;
            }

            function getStatusRequest() {
                var queryParams = {};
                switch ($scope.statusSelected) {
                    case 'filter-by-open-tasks':
                        queryParams = {
                            'status': 'open'
                        };
                        break;
                    case 'filter-by-closed-tasks':
                        queryParams = {
                            'status': 'closed'
                        };
                        break;
                    case 'filter-by-undefined-tasks':
                        queryParams = {
                            'status': 'withoutDate'
                        };
                        break;
                }

                $location.search('status', queryParams.status);

                return queryParams;
            }

            function getSortRequest() {
                var queryParams = {};
                switch ($scope.sortSelected) {
                    case 'centerMode_endDate':
                        queryParams = {
                            'initDate': 'desc'
                        };
                        break;
                    case 'centerMode_initDate':
                        queryParams = {
                            'initDate': 'asc'
                        };
                        break;
                    case 'exercises-sortby-created-recent':
                        queryParams = {
                            'updatedAt': 'desc'
                        };
                        break;
                    case 'exercises-sortby-created-old':
                        queryParams = {
                            'updatedAt': 'asc'
                        };
                        break;
                    case 'tasks-sortby-name-az':
                        queryParams = {
                            'name': 'asc'
                        };
                        break;
                    case 'tasks-sortby-name-za':
                        queryParams = {
                            'name': 'desc'
                        };
                        break;
                    default:
                        queryParams = {
                            'updatedAt': 'desc'
                        };
                }

                return queryParams;
            }

            $scope.sortExercises = function(sort) {
                $scope.sortSelected = sort;
                getTeacherExercisesPaginated();
            };

            $scope.filterByStatus = function(status) {
                $scope.statusSelected = status;
                getTeacherExercisesPaginated();
            };

            /************************
             **  INIT && WATCHERS ***
             ************************/

            $scope.$watch('search.searchExercisesText', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    if (newValue === '') {
                        $location.search('name', null);
                        $location.search('page', 1);
                    }
                    getTeacherExercisesPaginated();
                }
            });

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
