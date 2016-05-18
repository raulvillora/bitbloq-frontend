'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:ProjectCtrl
 * @description
 * # ProjectCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('ProjectCtrl', function($routeParams, $scope, $location, projectApi, alertsService, utils, _, $window, commonModals) {

        $scope.countAdded = function() {
            //model updated in projectApi
            $scope.project.timesAdded = $scope.project.timesAdded + 1;
        };

        $scope.countViewer = function(project) {
            //todo delete function
            if (project.codeProject) {
                $window.open('#/codeproject/' + project._id);
            } else {
                $window.open('#/bloqsproject/' + project._id);
            }
        };

        if ($routeParams.id) {
            projectApi.get($routeParams.id, {
                profile: true
            }).then(function(response) {
                $scope.project = response.data;
                if ($scope.project.videoUrl) {
                    $scope.videoID = utils.isYoutubeURL($scope.project.videoUrl);
                    $scope.imageShown = $scope.videoID;
                } else {
                    $scope.imageShown = '';
                }
                projectApi.getShortURL($location.$$absUrl).then(function(data) {
                    $scope.project.shortUrl = data.data.id;
                });
            }, function(response) {
                switch (response.status) {
                    case 404:
                        alertsService.add('no-project', 'error-project', 'warning');
                        break;
                    case 401: //unauthorized
                        alertsService.add('alert_text_errorProjectUnauthorized', 'load-project', 'warning');
                        break;
                    default:
                        alertsService.add('alert_text_errorProjectUndefined', 'error-project', 'warning');
                }
            });
        }

        $scope.projectApi = projectApi;
        $scope.utils = utils;
        $scope.commonModals = commonModals;
        // $scope.project.shortUrl = requestShortUrl($location.path());
    });
