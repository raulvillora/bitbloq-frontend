'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.faqsApi
 * @description
 * # faqsApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('faqsApi', function(envData, $q, $http, _, common) {

        var exports = {};

        var loadedPromise = $q.defer();

        exports.items = [];

        var request = function(pageSize, page) {
            exports.items = [];
            $http({
                method: 'GET',
                url: envData.config.resourcesEndpoint + 'resource/bitbloq:Faqs',
                params: {
                    'api:pageSize': pageSize,
                    'api:page': page
                }
            }).success(function(response) {
                exports.items = _.union(exports.items, response);

                if (response.length < pageSize) {
                    loadedPromise.resolve();
                } else {
                    request(pageSize, ++page);
                }

                common.isLoading = false;
            }).error(function(error) {
                common.isLoading = false;
                loadedPromise.reject(error);
            });
        };

        exports.itsLoaded = function() {
            return loadedPromise.promise;
        };

        // request(50, 0);

        return exports;
    });