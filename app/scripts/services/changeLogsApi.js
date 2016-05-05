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

        var request = function(pageSize, page) {
            exports.items = [];
            $http({
                method: 'GET',
                url: envData.config.serverUrl + 'changeLogs',
                params: {
                    'api:pageSize': pageSize,
                    'api:page': page,
                    'api:sort': {
                        'version.es-ES': 'asc'
                    }
                }
            }).then(function(response) {
                exports.items = _.union(exports.items, response.data);
                if (response.data.length < pageSize) {
                    loadedPromise.resolve();
                } else if (response.data.length > 0) {
                    request(pageSize, ++page);
                }

                common.isLoading = false;
            }, function(error) {
                common.isLoading = false;
                loadedPromise.reject(error);
            });
        };

        exports.itsLoaded = function() {
            return loadedPromise.promise;
        };

        request(50, 0);

        return exports;
    });