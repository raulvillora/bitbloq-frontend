'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:ExploreCtrl
 * @description
 * # ExploreCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('ExploreCtrl', function($scope, $log, $location, $routeParams, envData, _, projectApi, userApi) {

        $scope.componentFilter = function(newFilter) {
            if (newFilter === 'without-components' && $scope.componentsFilterOptions[0].value) {

                $scope.componentsFilterOptions.forEach(function(item) {
                    item.value = false;
                });
                $scope.componentsFilterOptions[0].value = true;
                $scope.componentsFilters = [];
                $scope.filterParams.compo = 'without-components';
            } else {
                if (newFilter) {
                    $scope.componentsFilterOptions[0].value = false;
                }
                $scope.componentsFilters = _.pluck(_.where($scope.componentsFilterOptions, {
                    value: true
                }), 'option');
                $scope.filterParams.compo = $scope.componentsFilters.length > 0 ? $scope.componentsFilters.join('+') : undefined;
            }
            if (newFilter) {
                $scope.search();
            }
        };

        $scope.genericFilter = function(newFilter, preventSearch) {
            if (newFilter && (newFilter !== 'bq' && $scope.genericFilterOptions[0].value) || (!$scope.genericFilterOptions[0].value)) {

                $scope.genericFilterOptions.forEach(function(item) {
                    item.value = false;
                });

                $scope.genericFilterOptions[0].value = false;

                $scope.genericFilters = [];
                delete $scope.filterParams.project;

            } else {

                $scope.genericFilterOptions[0].value = true;

                $scope.genericFilters = _.pluck(_.where($scope.genericFilterOptions, {
                    value: true
                }), 'option')[0];

                $scope.filterParams.project = $scope.genericFilters;
            }
            if (!preventSearch) {
                $scope.search();
            }
        };

        $scope.boardFilter = function(newFilter, preventSearch) {
            $scope.boardsFilterOptions.forEach(function(item) {
                if (item.option !== newFilter) {
                    item.value = false;
                }
            });
            $scope.boardFilters = _.pluck(_.where($scope.boardsFilterOptions, {
                value: true
            }), 'option')[0];
            $scope.filterParams.board = $scope.boardFilters;
            if (!preventSearch) {
                $scope.search();
            }
        };

        $scope.sort = function(option) {
            $scope.sortSelected = option;
            $scope.search();
        };

        $scope.search = function() {
            $scope.exploraProjects = [];
            $scope.pageProjects = 0;
            $location.search($scope.filterParams);
            $scope.getPublicProjects();
        };

        $scope.getPublicProjects = function() {
            var queryParamsArray = getRequest(),
                queryParams = queryParamsArray || {};

            if (!queryParams.page) {
                var pageParams = {
                    'page': $scope.pageProjects++
                };
                angular.extend(queryParams, pageParams);
            }
            $log.debug('getPublicProjects', queryParams);
            projectApi.getPublic(queryParams).then(function(response) {
                projectApi.getPublicCounter(queryParams).then(function(data) {
                    $scope.projectCount = $scope.exploraProjects.length + '/' + data.data.count;
                    $scope.common.isLoading = false;
                });
                if (queryParams['api:page'] === 0) {
                    $scope.exploraProjects = response.data;
                } else {
                    $scope.exploraProjects.push.apply($scope.exploraProjects, response.data);
                }

            }, function(error) {
                $log.debug('Get public projects error: ' + error);
            });
        };

        function _getUrlParams() {
            if ($routeParams.board) {
                $scope.boardsFilterOptions.forEach(function(board) {
                    if (board.option === $routeParams.board) {
                        board.value = true;
                        $scope.boardFilter(board.option, true);
                    }
                });
            }
            if ($routeParams.project) {
                $scope.genericFilterOptions.forEach(function(generic) {
                    if (generic.option === $routeParams.project) {
                        generic.value = false;
                        $scope.genericFilter(generic.option, true);
                    }
                });
                $scope.genericFilters = $routeParams.project;
            }
            if ($routeParams.compo) {
                $scope.componentsFilters = decodeURIComponent($routeParams.compo).split('+');
                $scope.componentsFilters.forEach(function(filter) {
                    $scope.componentsFilterOptions.forEach(function(element) {
                        if (filter === element.option) {
                            element.value = true;
                        }
                    });
                });
                $scope.componentFilter();
            }
            if ($routeParams.search) {
                $scope.searchText = decodeURIComponent($routeParams.search);
                $scope.filterParams.search = $scope.searchText;
            }
        }

        function getSortRequest() {
            var queryParams = {};
            switch ($scope.sortSelected) {
                case 'explore-sortby-views':
                    queryParams = {
                        'timesViewed': 'desc'
                    };
                    break;
                case 'explore-sortby-downloads':
                    queryParams = {
                        'timesDownloaded': 'desc'
                    };
                    break;
                case 'explore-sortby-adds':
                    queryParams = {
                        'timesAdded': 'desc'
                    };
                    break;
                default:
                    queryParams = {
                        'createdAt': 'desc'
                    };
            }

            return queryParams;
        }

        function getComponentFilterRequest(queryParams) {
            queryParams = queryParams || {
                'query': {}
            };

            if ($scope.componentsFilterOptions[0].value) {
                var componentsArray = _.pluck($scope.componentsFilterOptions, 'option');
                componentsArray.splice(0, 1);
                queryParams.query.hardwareTags = {
                    '$nin': componentsArray
                };
            } else {
                if ($scope.componentsFilters.length > 0) {
                    queryParams.query.hardwareTags = {
                        '$all': $scope.componentsFilters
                    };
                }
            }

            return queryParams;
        }

        function getBoardFilterRequest(queryParams) {
            queryParams = queryParams || {
                'query': {}
            };

            if ($scope.boardFilters) {
                if ($scope.boardFilters === 'Evolution' || $scope.boardFilters === 'Zowi' || $scope.boardFilters === 'mBot' || $scope.boardFilters === 'mRanger') {
                    queryParams.query['hardware.robot'] = $scope.boardFilters.toLowerCase();
                } else {
                    queryParams.query['hardware.board'] = $scope.boardFilters;
                }
            }

            return queryParams;
        }

        function getGenericFilterRequest(queryParams) {
            queryParams = queryParams || {
                'query': {}
            };

            if ($scope.genericFilterOptions[0].value) {
                if ($scope.genericFilters.indexOf('bq') > -1) {
                    queryParams.query.creator = envData.config.bqUserId;
                }
            }
            return queryParams;
        }

        function getSearchRequest(queryParams) {
            queryParams = queryParams || {
                'query': {}
            };

            if ($scope.searchText !== '') {
                queryParams.query.$or = [{
                    name: {
                        $regex: $scope.searchText,
                        $options: 'i'
                    }
                }, {
                    creator: {
                        $regex: $scope.searchText,
                        $options: 'i'
                    }
                }];
            }
            return queryParams;
        }

        function getRequest() {
            var queryParams = {
                    'query': {}
                },
                sortParams = getSortRequest();
            queryParams = getComponentFilterRequest(queryParams);
            queryParams = getGenericFilterRequest(queryParams);
            queryParams = getBoardFilterRequest(queryParams);
            queryParams = getSearchRequest(queryParams);

            $log.debug(sortParams);
            //angular.extend(queryParams, sortParams);
            return queryParams;
        }

        $scope.userApi = userApi;
        $scope.envData = envData;

        $scope.exploraProjects = [];
        $scope.searchText = '';
        $scope.users = [];
        $scope.itemsLayout = 'grid';
        $scope.pageProjects = 0;
        $scope.sortSelected = 'explore-sortby-recent';
        $scope.sortOptions = [
            'explore-sortby-recent',
            'explore-sortby-views',
            'explore-sortby-downloads'
        ];
        $scope.genericFilters = [];
        $scope.filterParams = {};
        $scope.genericFilterOptions = [
            //   {
            //     option: 'all',
            //     value: true
            // },
            //  {
            //     option: 'not-compiled',
            //     value: false
            // }, {
            //     option: 'compiled',
            //     value: false
            // },
            {
                option: 'bq',
                value: false
            }
        ];
        $scope.boardFilters = '';
        $scope.boardsFilterOptions = [{
            option: 'bq ZUM',
            value: false
        }, {
            option: 'Freaduino UNO',
            value: false
        }, {
            option: 'Arduino UNO',
            value: false
        }, {
            option: 'Zowi',
            value: false
        }, {
            option: 'Evolution',
            value: false
        }, {
            option: 'mBot',
            value: false
        }];
        $scope.componentsFilters = [];
        $scope.componentsFilterOptions = [{
            option: 'without-components',
            value: false
        }, {
            option: 'us',
            value: false
        }, {
            option: 'bt',
            value: false
        }, {
            option: 'button',
            value: false
        }, {
            option: 'buttons',
            value: false
        }, {
            option: 'irs',
            value: false
        }, {
            option: 'joystick',
            value: false
        }, {
            option: 'lcd',
            value: false
        }, {
            option: 'led',
            value: false
        }, {
            option: 'ldrs',
            value: false
        }, {
            option: 'pot',
            value: false
        }, {
            option: 'sp',
            value: false
        }, {
            option: 'servo',
            value: false
        }, {
            option: 'servocont',
            value: false
        }, {
            option: 'buzz',
            value: false
        }, {
            option: 'RGBled',
            value: false
        }, {
            option: 'sound',
            value: false
        }, {
            option: 'rtc',
            value: false
        }, {
            option: 'hts221',
            value: false
        }, {
            option: 'encoder',
            value: false
        }, {
            option: 'limitswitch',
            value: false
        }];

        angular.element('.explore-view').bind('scroll', function(evt) {
            if ((evt.currentTarget.scrollTop + evt.currentTarget.clientHeight + 100) >= evt.currentTarget.scrollHeight) {
                $scope.getPublicProjects();
                $scope.$apply();
            }
        });

        $scope.$watch('searchText', function(newValue, oldValue) {
            if (newValue !== oldValue) {
                if (newValue) {
                    $scope.filterParams.search = newValue;
                } else {
                    delete $scope.filterParams.search;
                }
                $scope.search();
            }
        });

        $scope.common.isLoading = true;

        if ($routeParams) {
            _getUrlParams();
            $scope.search();
        } else {
            $scope.getPublicProjects();
        }
    });