'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.imageApi
 * @description
 * # imageApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('robotFirmwareApi', function($http, envData) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        var api = {};

        function getFirmwareUrl(robot, version) {
            return envData.config.serverUrl + 'robotsFirmware/'+ robot +'/' + version;
        }


        api.getFirmware = function(robot, version) {
            return $http({
                method: 'GET',
                url: getFirmwareUrl(robot, version)
            });
        };

        api.deleteFirmware = function(robot, version) {
            return $http({
                method: 'DELETE',
                url: getFirmwareUrl(robot, version)
            });
        };

        api.createFirmware = function(robot, version, file) {
            var formData = new FormData();
            formData.append('file', file);
            return $http.post(getFirmwareUrl(robot, version), formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        };

        return api;
    });
