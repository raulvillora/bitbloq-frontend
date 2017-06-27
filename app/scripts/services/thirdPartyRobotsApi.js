'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.thirdPartyRobotsApi
 * @description
 * # thirdPartyRobotsApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('thirdPartyRobotsApi', function($http, envData) {

        var thirdPartyRobotsApi = {
            exchangeCode: exchangeCode,
            startTrial: startTrial
        };

        function exchangeCode(code, robotFamily, centerId) {
            return $http({
                method: 'POST',
                url: envData.config.centerModeUrl + 'third-party-robots/activate',
                data: {
                    code: code,
                    robot: robotFamily,
                    centerId: centerId
                }
            });
        }

        function startTrial(robotFamily) {
            return $http({
                method: 'POST',
                url: envData.config.centerModeUrl + 'third-party-robots/trial',
                data: {
                    robot: robotFamily
                }
            });
        }
        return thirdPartyRobotsApi;
    });
