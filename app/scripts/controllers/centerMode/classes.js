(function() {
    'use strict';
    /**
     * @ngdoc function
     * @name bitbloqApp.controller:ClassesCtrl
     * @description
     * # ClassesCtrl
     * Controller of the bitbloqApp
     */
    angular.module('bitbloqApp')
        .controller('ClassesCtrl', function($log, $scope, _, alertsService, centerModeApi, centerModeService, $routeParams, $translate, $rootScope, $location, userApi, utils, ngDialog) {
            $scope.groups = [];
            $scope.teacher = {};
            $scope.centerModeService = centerModeService;
            $scope.classesStatusArray = [];
            $scope.orderInstance = 'name';
            $scope.pageno = 1;
            $scope.classesArray = [];
            $scope.itemsPerPage = 10;
            $scope.groupsPerPage = 9;
            $scope.search = {};
            $scope.filterClassesParams = {};
            $scope.pagination = {
                'mygroups': {
                    'current': 1
                }
            };
            $scope.groupArray = {};
            $scope.classesStatusArray = ['all-classes', 'closed-classes'];
            $scope.sortSelected = 'last-classes';
            $scope.sortClassesArray = ['name', 'last-classes', 'old-classes'];

            $scope.colorPickerFlag = {};
            $scope.common.isLoading = true;

            $scope.changeGroupColor = function() {
                centerModeApi.updateGroup($scope.group).then(function() {
                    $scope.colorPickerFlag.open = false;
                });
            };

            $scope.newGroup = function() {
                centerModeService.newGroup($scope.teacher._id || $scope.common.user._id, centerModeService.center._id)
                    .then(function() {
                        _getGroups();
                    });
            };

            $scope.getMyGroupsPage = function(page) {
                var queryParamsArray = getRequest(),
                    queryParams = queryParamsArray || {},
                    groupPage = page ? page : 1;

                var pageParams = {
                    'page': groupPage
                };

                angular.extend(queryParams, pageParams);

                centerModeApi.getGroups('teacher', null, centerModeService.center._id, null, queryParams).then(function(response) {
                    $scope.groups = response.data.groups;
                    $scope.groupsCount = response.data.counter;
                    $location.search(_.extend(_.cloneDeep(queryParams.sortParams), _.cloneDeep(queryParams.statusParams), _.cloneDeep(queryParams.searchParams ? {
                        'search': queryParams.searchParams
                    } : {}), _.cloneDeep(pageParams)));
                }).finally(function() {
                    $scope.common.isLoading = false;
                });
            };

            $scope.getCenterGroups = function(center) {
                var page;
                centerModeService.setCenter(center);
                if ($routeParams.updatedAt) {
                    $scope.sortSelected = getSortOption($routeParams.updatedAt);
                }
                if ($routeParams.status) {
                    $scope.statusSelected = getStatusOption($routeParams.status);
                }
                if ($routeParams.search) {
                    $scope.search.searchClassesText = $routeParams.search;
                }
                if ($routeParams.page) {
                    page = $routeParams.page;
                    $scope.pagination.mygroups.current = $routeParams.page;
                }
                $scope.getMyGroupsPage(page);
            };

            $scope.goTo = function(url, event) {
                if (event.target.className.indexOf('group__info__header__id') === -1) {
                    $location.path(url);
                }
            };

            $scope.sortClasses = function(option) {
                $scope.sortSelected = option;
                $scope.searchClasses();
            };
            $scope.filterByStatus = function(option) {
                $scope.statusSelected = option;
                $scope.searchClasses();
            };

            $scope.searchClasses = function() {
                $location.search($scope.filterClassesParams);
                $scope.getMyGroupsPage();
            };

            $scope.isLoading = true;
            /**************************
             ***  PRIVATE FUNCTIONS ***
             **************************/

            function _init() {
                $scope.common.itsUserLoaded().then(function() {
                    if ($scope.common.section === 'confirm-teacher') {
                        _congratulations($routeParams.token);
                    } else {
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
                    }
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

            function _congratulations(token) {
                centerModeApi.confirmAddTeacher(token).then(function(response) {
                    var modalOptions = $rootScope.$new(),
                        extraButton = 'centerMode_button_createCenter-try';
                    if ($scope.common.user.birthday && utils.userIsUnder14($scope.common.user.birthday)) {
                        extraButton = null;
                    }
                    var confirmationTitle = $translate.instant('centerMode_modal_confirmation-title', {
                        value: response.data
                    });
                    _.extend(modalOptions, {
                        title: 'welcome',
                        contentTemplate: 'views/modals/centerMode/informationCenterMode.html',
                        confirmationTitle: confirmationTitle,
                        customClass: 'modal--information',
                        confirmButton: 'centerMode_modal_confirmation-button',
                        confirmAction: function() {
                            ngDialog.close(centerModal);
                        },
                        modalButtons: true,
                        errors: false
                    });

                    var centerModal = ngDialog.open({
                        template: '/views/modals/modal.html',
                        className: 'modal--container modal--centerMode',
                        scope: modalOptions

                    });
                    $location.path('/classes');
                    $scope.common.userRole = 'teacher';
                }).catch(function(err) {
                    console.log(err);
                    if (err.data) {
                        switch (err.data.code) {
                            case 403:
                                //otro user
                                $location.path('/projects');
                                alertsService.add({
                                    text: $scope.common.translate('centerMode_alert_confirmTeacherError1', {
                                        value: err.data.center
                                    }),
                                    id: 'addTeacher',
                                    type: 'error',
                                    linkText: 'close-session',
                                    link: function() {
                                        userApi.logout();
                                        $scope.common.setUser(null);
                                        localStorage.projectsChange = false;
                                        $location.url('/');
                                        alertsService.closeByTag('addTeacher');
                                    }
                                });

                                break;
                            case 404:
                                //otro user
                                $location.path('/projects');
                                alertsService.add({
                                    text: $scope.common.translate('centerMode_alert_confirmTeacherError2', {
                                        value: err.data.center
                                    }),
                                    id: 'addTeacher',
                                    type: 'error'
                                });

                                break;
                            case 409:
                                $location.path('/classes');
                                break;
                            default:
                                alertsService.add({
                                    text: 'centerMode_modal_confirmation-error',
                                    id: 'addTeacher',
                                    type: 'error'
                                });
                        }
                    } else {
                        alertsService.add({
                            text: 'centerMode_modal_confirmation-error',
                            id: 'addTeacher',
                            type: 'error'
                        });
                    }
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

            function getRequest() {
                var queryParams = {},
                    sortParams = getSortRequest(),
                    statusParams = getStatusRequest();
                queryParams = getSearchRequest(queryParams);

                queryParams = _.extend(queryParams, sortParams);
                queryParams = _.extend(queryParams, statusParams);

                return queryParams;

            }

            function getSearchRequest(queryParams) {
                queryParams = queryParams || {};

                if (($scope.search.searchClassesText && $scope.search.searchClassesText !== '')) {
                    queryParams.searchParams = $scope.search.searchClassesText;
                }

                return queryParams;
            }

            function getSortRequest() {
                var queryParams = {};

                switch ($scope.sortSelected) {
                    case 'name':
                        queryParams.sortParams = {
                            'name': 'asc'
                        };
                        break;
                    case 'last-classes':
                        queryParams.sortParams = {
                            'updatedAt': 'desc'
                        };
                        break;
                    case 'old-classes':
                        queryParams.sortParams = {
                            'updatedAt': 'asc'
                        };
                        break;
                }

                return queryParams;
            }

            function getStatusRequest() {
                var queryParams = {};
                switch ($scope.statusSelected) {
                    case 'closed-classes':
                        queryParams.statusParams = {
                            'status': 'closed'
                        };
                        break;
                }

                return queryParams;
            }

            function _checkUrl() {
                centerModeService.setCenter();
                $scope.secondaryBreadcrumb = true;
                _getGroups();
            }

            function getSortOption(parameter) {
                var sortOption;
                switch (parameter) {
                    case 'asc':
                        sortOption = 'old-classes';
                        break;
                    case 'desc':
                        sortOption = 'last-classes';
                        break;
                }

                return sortOption;
            }

            function getStatusOption(parameter) {
                var statusOption;
                switch (parameter) {
                    case 'closed':
                        statusOption = 'closed-classes';
                        break;
                }

                return statusOption;
            }

            /************************
             **  INIT && WATCHERS ***
             ************************/

            $scope.$watch('search.searchClassesText', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    if (newValue) {
                        $scope.filterClassesParams.search = newValue;
                        $scope.searchClasses();
                    } else {
                        if (newValue === '') {
                            $scope.filterClassesParams = {};
                            $scope.searchClasses();
                            $location.search('name', null);
                            $location.search('page', 1);
                        }
                        delete $scope.filterClassesParams.search;
                    }
                }
            });

            _init();
        });
})();
