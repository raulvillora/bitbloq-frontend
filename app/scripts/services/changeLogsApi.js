'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.changeLogsApi
 * @description
 * # changeLogsApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('changeLogsApi', function(envData, $q, $http, _, common) {

        var exports = {};

        var loadedPromise = $q.defer();

        exports.items = [];

        var request = function() {
            exports.items = [];
            $http({
                method: 'GET',
                url: envData.config.serverUrl + 'changelog'
            }).then(function(response) {
                exports.items = response.data;
                common.isLoading = false;
                loadedPromise.resolve();
            }, function(error) {
                common.isLoading = false;
                loadedPromise.reject(error);
            });
        };

        exports.itsLoaded = function() {
            return loadedPromise.promise;
        };

        request();

        return exports;
    });
