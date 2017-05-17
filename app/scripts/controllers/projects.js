'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:ProjectsCtrl
 * @description
 * # ProjectsCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('ProjectsCtrl', function($log, $scope, $q, projectApi, $location, $localStorage, alertsService, $window, commonModals, utils, _, moment, JSZip, projectService, $routeParams) {

        $scope.projectService = projectService;
        $scope.utils = utils;
        $scope.itemsPerPage = 20;
        $scope.pagination = {
            'myprojects': {
                'current': 1
            }
        };

        $scope.projectsCount = 0;

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
            $scope.common.removeProjects[project._id] = true;
            $scope.removeAlert[project._id] = alertsService.add({
                text: 'make-deleted-project',
                id: 'deleted-project' + project._id,
                type: 'warning',
                time: 7000,
                linkText: 'undo',
                link: _undoRemoveProject,
                linkParams: project._id,
                closeFunction: _deleteProject,
                closeParams: {
                    _id: project._id,
                    imageType: project.imageType
                }
            });
        };

        $scope.filterProjects = function(type) {
            $log.debug('filterProjects', type);
            $scope.userProjectsFilter = type;
        };

        $scope.inRemoveProjects = function(item) {
            return !$scope.common.removeProjects[item._id];
        };

        $scope.downloadAllProjects = function() {
            var zip = new JSZip(),
                currentProject,
                currentProjectName,
                projectsToDownload = [],
                j = 1;
            for (var i = 0; i < $scope.filtered.projects.length; i++) {
                currentProject = projectService.getCleanProject($scope.filtered.projects[i], true);
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
        };

        $scope.refreshProjects = function(refresh) {
            $scope.common.isLoading = refresh;
            $scope.common.itsUserLoaded().then(function() {
                $scope.tempUserProjects = [];

                var getSharedProjects = projectApi.getMySharedProjects();
                var page = $routeParams.page ? $routeParams.page : 1;
                $q.all([$scope.getMyProjectsPage(page), getSharedProjects]).then(function(values) {
                    $scope.sharedProjects = values[1];
                    $scope.common.isLoading = false;

                }).catch(function() {
                    $scope.sharedProjects = [];
                    $scope.common.isLoading = false;
                });

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

        function _deleteProject(project) {
            if ($scope.common.removeProjects[project._id]) {
                projectApi.delete(project._id).then(function() {
                    $log.log('we delete this project');
                }, function(error) {
                    $log.log('Delete error: ', error);
                    alertsService.add({
                        text: 'make-delete-project-error',
                        id: 'deleted-project',
                        type: 'warning'
                    });

                });
            }
        }

        /*  function _getProjects() {
              return projectApi.getMyProjects().then(function(response) {
                  projectApi.getMyProjectsCounter().then(function(data) {
                      $scope.projectsCount = data.data.count;
                      $scope.common.isLoading = false;
                  });

                  $scope.userProjects = _.clone(response.data);

              }).catch(function() {
                  $scope.common.setUser();
                  alertsService.add({
                      text: 'projects-need-tobe-logged',
                      id: 'projects-need-tobe-logged',
                      type: 'error'
                  });
                  $location.path('/login');
              });
          }*/

        $scope.getMyProjectsPage = function(newPageNumber) {
            var queryParamsArray = getRequest(),
                queryParams = queryParamsArray || {};

            var pageParams = {
                'page': newPageNumber - 1
            };
            angular.extend(queryParams, pageParams);
            $log.debug('getProjects', queryParams);

            console.log('vamos a imprimir queryParams');
            console.log(queryParams);

            return projectApi.getMyProjects(queryParams).then(function(response) {
                projectApi.getMyProjectsCounter(queryParams).then(function(data) {
                    $scope.projectsCount = data.data.count;
                    $scope.common.isLoading = false;
                    console.log($scope.projectsCount);

                });

                console.log($scope.projectsCount);

                $scope.userProjects = _.clone(response.data);
                $scope.pagination.myprojects.current = newPageNumber;
                $location.search('page', newPageNumber);

            }).catch(function() {
                $scope.common.setUser();
                alertsService.add({
                    text: 'projects-need-tobe-logged',
                    id: 'projects-need-tobe-logged',
                    type: 'error'
                });
                $location.path('/login');
            });

        };

        function getRequest() {
            var queryParams = {
                    'query': {}
                },
                sortParams = getSortRequest();
            queryParams = getSearchRequest(queryParams);

            //$log.debug(sortParams);
            angular.extend(queryParams, sortParams);
            console.log('queryParams en la función');
            console.log(queryParams);
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

        $scope.sort = function(option) {
            $scope.sortSelected = option;
            $scope.search();
        };

        function _getUrlParams() {
            if ($routeParams.search) {
                $scope.searchText.text = decodeURIComponent($routeParams.search);
                $scope.filterParams.search = $scope.searchText.text;
            }
            if ($routeParams.page) {
                $scope.pagination.myprojects.current = $routeParams.page;
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

        function _undoRemoveProject(projectId) {
            alertsService.close($scope.removeAlert[projectId]);
            $scope.common.removeProjects[projectId] = false;
        }

        $scope.timestamp = new Date().getTime();
        $scope.commonModals = commonModals;
        $scope.projectApi = projectApi;
        $scope.selectedTab = 'projects';
        $scope.itemsLayout = 'grid';
        $scope.orderOptions = ['explore-sortby-recent', 'explore-sortby-old', 'explore-sortby-name-az', 'explore-sortby-name-za'];
        $scope.filterOptions = ['filter-by-all', 'filter-by-not-published', 'filter-by-published', 'filter-by-shared', 'filter-by-compile', 'filter-by-not-compile'];

        $scope.userProjectsOrderBy = 'updatedAt';
        $scope.userProjectsReverseOrder = true;

        $scope.userProjectsFilter = 'all';
        $scope.userProjects = [];
        $scope.tempUserProjects = [];
        $scope.sharedProjects = [];
        $scope.removeAlert = [];
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
            $scope.getMyProjectsPage($scope.pagination.myprojects.current);
        };
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

        if ($routeParams) {
            _getUrlParams();
            $scope.search();
        } else {
            $scope.getPublicProjects();
        }
        $scope.$on('$destroy', function() {
            $window.onfocus = null;
        });

    });
