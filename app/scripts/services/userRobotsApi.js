'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.thirdPartyRobotsApi
 * @description
 * # thirdPartyRobotsApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('userRobotsApi', function($http, envData) {
        var userRobotsApi = {
            getUserRobots: getUserRobots
        };

        function getUserRobots(userId) {
            return $http({
                method: 'GET',
                url: envData.config.centerModeUrl + 'user-robots/' + userId,
            });
        }

        return userRobotsApi;
    });
