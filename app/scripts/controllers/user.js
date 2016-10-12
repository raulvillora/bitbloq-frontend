'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:UserCtrl
 * @description
 * # UserCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('UserCtrl', function($scope, $translate, $routeParams, $location, projectApi, userApi, _) {

        $scope.translate = $translate;
        $scope.userProjects = [];
        $scope.publicProjects = [];
        $scope.users = [];
        $scope.userId = $routeParams.id;
        $scope.sortSelected = 'explore-sortby-recent';
        $scope.sortOptions = [
            'explore-sortby-recent',
            'explore-sortby-views',
            'explore-sortby-downloads'
        ];

        function requestProjects() {
            return projectApi.getPublic().then(function(publicProjects) {
                publicProjects = publicProjects.data;
                $scope.userProjects = _.filter(publicProjects, _.matches({
                    'creator': $scope.userId
                }));
                $scope.projectCount = $scope.userProjects.length;
            });
        }

        if ($routeParams.id) {
            // $log.debug($routeParams.id);
            userApi.getProfile($routeParams.id).success(function(data) {
                $scope.user = data[0];
                requestProjects();
            }).error(function() {
                $location.path('#/404');
            });
        } else {
            $location.path('#/404');
        }

        angular.element('.explore__content').bind('scroll', function(evt) {
            //$log.debug('scroll!!', evt, evt.currentTarget.scrollTop, evt.currentTarget.clientHeight, evt.currentTarget.scrollHeight);
            if ((evt.currentTarget.scrollTop + evt.currentTarget.clientHeight + 100) >= evt.currentTarget.scrollHeight) {
                $scope.requestProjects();
                $scope.$apply();
            }
        });
    });
