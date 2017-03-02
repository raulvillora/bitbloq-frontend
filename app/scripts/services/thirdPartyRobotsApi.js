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
            exchangeCode: exchangeCode
        };

        function exchangeCode(code, robotFamily) {
            return $http({
                method: 'POST',
                url: envData.config.centerModeUrl + 'third-party-robots/activate',
                data: {
                    code: code,
                    robot: robotFamily
                }
            });
        }
        return thirdPartyRobotsApi;
    });
