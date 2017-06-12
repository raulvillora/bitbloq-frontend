'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:ProjectsCtrl
 * @description
 * # ProjectsCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('ProjectsCtrl', function($log, $scope, $q, projectApi, $location, $localStorage, alertsService, $window, commonModals, utils, _, moment, JSZip, projectService, $route, $routeParams) {

        $scope.projectService = projectService;
        $scope.utils = utils;
        $scope.itemsPerPage = 20;
        $scope.pagination = {
            'myprojects': {
                'current': 1
            },
            'sharedprojects': {
                'current': 1
            },
            'mytrash': {
                'current': 1
            }
        };

        $scope.projectsCount = 0;
        $scope.sharedCount = 0;
        $scope.trashCount = 0;

        $scope.timestamp = new Date().getTime();
        $scope.commonModals = commonModals;
        $scope.projectApi = projectApi;
        $scope.selectedTab = 'myprojects';
        $scope.itemsLayout = 'grid';
        $scope.orderOptions = ['explore-sortby-recent', 'explore-sortby-old', 'explore-sortby-name-az', 'explore-sortby-name-za'];
        $scope.filterOptions = ['filter-by-all', 'filter-by-not-published', 'filter-by-published', 'filter-by-shared', 'filter-by-compile', 'filter-by-not-compile'];

        $scope.userProjectsOrderBy = 'updatedAt';
        $scope.userProjectsReverseOrder = true;

        $scope.userProjectsFilter = 'all';
        $scope.userProjects = [];
        $scope.tempUserProjects = [];
        $scope.sharedProjects = [];
        $scope.filterParams = {};
        $scope.searchText = {};
        $scope.modal = {
            projectCloneName: ''
        };
        $scope.filtered = {
            projects: []
        };

        var softwareProjectDefault = {
            vars: {
                enable: true,
                name: 'varsBloq',
                childs: [],
                content: [
                    []
                ]
            },
            setup: {
                enable: true,
                name: 'setupBloq',
                childs: [],
                content: [
                    []
                ]
            },
            loop: {
                enable: true,
                name: 'loopBloq',
                childs: [],
                content: [
                    []
                ]
            }
        };

        $scope.sortProjects = function(type) {
            $log.debug('sortProject', type);
            switch (type) {
                case 'explore-sortby-recent':
                    $scope.userProjectsOrderBy = 'updatedAt';
                    $scope.userProjectsReverseOrder = true;
                    break;
                case 'explore-sortby-old':
                    $scope.userProjectsOrderBy = 'updatedAt';
                    $scope.userProjectsReverseOrder = false;
                    break;
                case 'explore-sortby-name-az':
                    $scope.userProjectsOrderBy = 'name';
                    $scope.userProjectsReverseOrder = false;
                    break;
                case 'explore-sortby-name-za':
                    $scope.userProjectsOrderBy = 'name';
                    $scope.userProjectsReverseOrder = true;
                    break;
            }
        };

        /*
         +      o     +              o
         +             o     +       +
         o          +
         o  +           +        +
         +        o     o       +        o
         -_-_-_-_-_-_-_,------,      o
         _-_-_-_-_-_-_-|   /\_/\
         -_-_-_-_-_-_-~|__( ^ .^)  +     +
         _-_-_-_-_-_-_-""  ""
         +      o         o   +       o
         +         +
         o        o         o      o     +
         o           +
         +      +     o        o      +
         */
        $scope.userProjectsFilterFunction = function(filter) {
            return function(item) {
                var result = false;
                switch (filter) {
                    case 'all':
                        result = true;
                        break;
                    case 'my-projects-published':
                        result = item._acl.ALL;
                        break;
                    case 'my-projects-not-published':
                        result = !item._acl.ALL;
                        break;
                    case 'my-projects-shared':
                        for (var acl in item._acl) {
                            if (acl !== 'ALL' && item._acl[acl].permission !== 'ADMIN') {
                                result = true;
                            }
                        }
                        break;
                }
                return result;
            };
        };

        $scope.createCopy = function(project) {
            commonModals.clone(project).then(function() {
                $scope.refreshProjects();
            });
        };

        $scope.removeProject = function(project) {
            projectApi.delete(project._id).then(function() {
                $scope.refreshProjects();
                alertsService.add({
                    text: 'projects_toast_send-to-trash',
                    id: 'deleted-project',
                    type: 'info',
                    time: 7000
                });
            }, function(error) {
                $log.log('Delete error: ', error);
                alertsService.add({
                    text: 'make-delete-project-error',
                    id: 'deleted-project',
                    type: 'warning'
                });

            });
        };

        $scope.removePermanentProject = function(project) {
            projectApi.deletePermanent(project._id).then(function() {
                $scope.refreshProjects();
                alertsService.add({
                    text: 'make-deleted-project',
                    id: 'deleted-project',
                    type: 'info',
                    time: 7000
                });
            });
        };

        $scope.filterProjects = function(type) {
            $log.debug('filterProjects', type);
            $scope.userProjectsFilter = type;
        };

        $scope.downloadAllProjects = function() {
            var zip = new JSZip(),
                currentProject,
                currentProjectName,
                projectsToDownload = [],
                j = 1;

            projectApi.getMyProjects({
                'pageSize': $scope.projectsCount
            }).then(function(response) {
                for (var i = 0; i < response.data.length; i++) {
                    currentProject = projectService.getCleanProject(response.data[i], true);
                    currentProjectName = utils.removeDiacritics(currentProject.name).substring(0, 30);
                    if (projectsToDownload.indexOf(currentProjectName) > -1) {
                        currentProjectName = currentProjectName + '_' + j;
                    }
                    projectsToDownload.push(currentProjectName);
                    zip.file(currentProjectName + '.bitbloq', JSON.stringify(currentProject));
                    j++;
                }
                var blob = zip.generate({
                    type: 'blob'
                });
                utils.downloadFile('Bitbloq_' + moment().format('YYYY_MM_DD-HH_mm') + '.zip', blob, 'data:application/zip;base64');
            });

        };

        $scope.refreshProjects = function(refresh) {
            $scope.common.isLoading = refresh;
            $scope.common.itsUserLoaded().then(function() {

                $scope.tempUserProjects = [];
                var page = $routeParams.page ? $routeParams.page : 1;
                $scope.getMyProjectsPage(page);
                $scope.getMySharedProjectsPage(page);
                $scope.getMyTrashPage(page);

            }).catch(function() {
                $scope.common.isLoading = false;
                $scope.common.setUser();
                alertsService.add({
                    text: 'projects-need-tobe-logged',
                    id: 'projects-need-tobe-logged',
                    type: 'error'
                });
                $location.path('/login');
            });
        };

        $scope.restoreProject = function(project) {
            projectApi.restore(project._id).then(function() {
                alertsService.add({
                    text: 'projects_toast_restore',
                    id: 'deleted-project',
                    type: 'info',
                    time: 7000
                });
                $scope.refreshProjects();
            });
        };

        $scope.checkSearch = function(textSearch) {
            if (textSearch) {
                while (textSearch[0] === '!') {
                    textSearch = textSearch.substr(1);
                }
            }
            return textSearch;
        };

        $scope.publishProject = function(project, type) {
            type = type || '';
            var projectEmptyName = $scope.common.translate('new-project');
            if (!project.name || project.name === projectEmptyName) {
                if (!project.description) {
                    alertsService.add({
                        text: 'publishProject__alert__nameDescriptionError' + type,
                        id: 'publishing-project',
                        type: 'warning'
                    });
                } else {
                    alertsService.add({
                        text: 'publishProject__alert__nameError' + type,
                        id: 'publishing-project',
                        type: 'warning'
                    });
                }
            } else if (!project.description) {
                alertsService.add({
                    text: 'publishProject__alert__descriptionError' + type,
                    id: 'publishing-project',
                    type: 'warning'
                });
            } else if (!project.codeProject) {
                if (_.isEqual(softwareProjectDefault, project.software)) {
                    alertsService.add({
                        text: 'publishProject__alert__bloqsProjectEmpty' + type,
                        id: 'publishing-project',
                        type: 'warning'
                    });
                } else {
                    $scope.publishProjectError = false;
                    if (type === 'Social') {
                        commonModals.shareSocialModal(project);
                    } else {
                        commonModals.publishModal(project);
                    }
                }
            } else {
                if (type === 'Social') {
                    commonModals.shareSocialModal(project);
                } else {
                    commonModals.publishModal(project);
                }
            }
        };

        $scope.getMySharedProjectsPage = function(newPageNumber) {
            var queryParamsArray = getRequest(),
                queryParams = queryParamsArray || {};

            var pageParams = {
                'page': newPageNumber - 1
            };
            angular.extend(queryParams, pageParams);
            $log.debug('getSharedProjects', queryParams);
            return projectApi.getMySharedProjects(queryParams).then(function(response) {
                projectApi.getMySharedProjectsCounter(queryParams).then(function(data) {
                    $scope.sharedCount = data.data.count;
                    $scope.common.isLoading = false;
                });

                $scope.sharedProjects = _.clone(response.data);
                $scope.pagination.sharedprojects.current = newPageNumber;
                $location.search('page', newPageNumber);

            }).catch(function() {
                $scope.sharedProjects = [];
                $scope.common.isLoading = false;
                $scope.common.setUser();
                alertsService.add({
                    text: 'projects-need-tobe-logged',
                    id: 'projects-need-tobe-logged',
                    type: 'error'
                });
                $location.path('/login');
            });
        };

        $scope.getMyProjectsPage = function(newPageNumber) {
            var queryParamsArray = getRequest(),
                queryParams = queryParamsArray || {};

            var pageParams = {
                'page': newPageNumber - 1
            };
            angular.extend(queryParams, pageParams);
            $log.debug('getProjects', queryParams);

            return projectApi.getMyProjects(queryParams).then(function(response) {
                projectApi.getMyProjectsCounter(queryParams).then(function(data) {
                    $scope.projectsCount = data.data.count;
                    $scope.common.isLoading = false;
                });

                $scope.userProjects = _.clone(response.data);
                $scope.pagination.myprojects.current = newPageNumber;
                $location.search('page', newPageNumber);

            }).catch(function() {
                $scope.userProjects = [];
                $scope.common.isLoading = false;
                $scope.common.setUser();
                alertsService.add({
                    text: 'projects-need-tobe-logged',
                    id: 'projects-need-tobe-logged',
                    type: 'error'
                });
                $location.path('/login');
            });

        };

        $scope.getMyTrashPage = function(newPageNumber) {
            var queryParamsArray = getRequest(),
                queryParams = queryParamsArray || {};

            var pageParams = {
                'page': newPageNumber - 1
            };
            angular.extend(queryParams, pageParams);
            return projectApi.getMyTrash(queryParams).then(function(response) {
                projectApi.getMyTrashProjectsCounter(queryParams).then(function(data) {
                    $scope.trashCount = data.data.count;
                    $scope.common.isLoading = false;
                });
                $scope.trashProjects = _.clone(response.data);
                $scope.pagination.mytrash.current = newPageNumber;
                $location.search('page', newPageNumber);

            }).catch(function() {
                $scope.trashProjects = [];
                $scope.common.isLoading = false;
                $scope.common.setUser();
                alertsService.add({
                    text: 'projects-need-tobe-logged',
                    id: 'projects-need-tobe-logged',
                    type: 'error'
                });
                $location.path('/login');
            });
        };

        $scope.goTo = function(tab) {
            $scope.searchText.text = '';
            $routeParams.search = null;
            $route.current.pathParams.tab = tab;
            $routeParams.page = 1;
            $scope.selectedTab = tab;
            $location.path('/projects/' + tab);
            $location.search('page', 1);
            _getUrlParams();
            $scope.search();
        };

        $scope.sort = function(option) {
            $scope.sortSelected = option;
            $scope.search();
        };

        $scope.renameProject = function(project) {
            commonModals.rename(project).then(function() {
                projectApi.update(project._id, project).then(function() {
                    $scope.refreshProjects();
                });
            });
        };

        $scope.search = function() {
            $scope.exploraProjects = [];
            $scope.pageProjects = 0;
            _.extend($scope.filterParams, {
                'page': $scope.pagination.myprojects.current
            });
            $location.search($scope.filterParams);
            switch ($scope.selectedTab) {
                case 'myprojects':
                    $scope.getMyProjectsPage($scope.pagination.myprojects.current);
                    break;
                case 'sharedprojects':
                    $scope.getMySharedProjectsPage($scope.pagination.sharedprojects.current);
                    break;
                case 'trash':
                    $scope.getMyTrashPage($scope.pagination.mytrash.current);
                    break;
            }
        };

        function getRequest() {
            var queryParams = {
                    'query': {}
                },
                sortParams = getSortRequest();
            queryParams = getSearchRequest(queryParams);

            //$log.debug(sortParams);
            angular.extend(queryParams, sortParams);
            return queryParams;
        }

        function getSearchRequest(queryParams) {
            queryParams = queryParams || {
                'query': {}
            };
            if ($scope.searchText.text) {
                queryParams.query = {
                    name: {
                        $regex: $scope.searchText.text,
                        $options: 'i'
                    }
                };
            }
            return queryParams;
        }

        function _getUrlParams() {
            if ($routeParams.search) {
                $scope.searchText.text = decodeURIComponent($routeParams.search);
                $scope.filterParams.search = $scope.searchText.text;
            }
            if ($routeParams.page) {
                switch ($scope.selectedTab) {
                    case 'myprojects':
                        $scope.pagination.myprojects.current = $routeParams.page;
                        $scope.pagination.sharedprojects.current = 1;
                        $scope.pagination.mytrash.current = 1;
                        break;
                    case 'sharedprojects':
                        $scope.pagination.myprojects.current = 1;
                        $scope.pagination.sharedprojects.current = $routeParams.page;
                        $scope.pagination.mytrash.current = 1;
                        break;
                    case 'mytrash':
                        $scope.pagination.myprojects.current = 1;
                        $scope.pagination.sharedprojects.current = 1;
                        $scope.pagination.mytrash.current = $routeParams.page;
                        break;
                }
            }
        }

        function getSortRequest() {
            var queryParams = {};
            switch ($scope.sortSelected) {
                case 'explore-sortby-recent':
                    queryParams = {
                        'updatedAt': 'desc'
                    };
                    break;
                case 'explore-sortby-old':
                    queryParams = {
                        'updatedAt': 'asc'
                    };
                    break;
                case 'explore-sortby-name-az':
                    queryParams = {
                        'name': 'asc'
                    };
                    break;
                case 'explore-sortby-name-za':
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

        function _init() {
            if ($location.path().indexOf('sharedproject') > -1) {
                $scope.selectedTab = 'sharedprojects';
            }
            if ($location.path().indexOf('trash') > -1) {
                $scope.selectedTab = 'trash';
            }
            $route.current.pathParams.tab = $scope.selectedTab;
            _getUrlParams();
            $scope.search();
        }

        _init();

        // Get projects
        $scope.refreshProjects(true);

        $window.onfocus = function() {
            $scope.$apply(function() {
                $scope.timestamp = Date.now();
            });
            if (JSON.parse(localStorage.projectsChange) && $scope.common.itsUserLoaded()) {
                localStorage.projectsChange = false;
                $scope.refreshProjects();
            }

        };

        $scope.$watch('searchText.text', function(newValue, oldValue) {
            if (newValue !== oldValue) {
                if (newValue) {
                    $scope.filterParams.search = newValue;
                } else {
                    delete $scope.filterParams.search;
                }
                $scope.search();
            }
        });

        $scope.$on('$destroy', function() {
            $window.onfocus = null;
        });
    });
