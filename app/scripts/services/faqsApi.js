'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.faqsApi
 * @description
 * # faqsApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('faqsApi', function(envData, $q, $http, common) {

        var exports = {};

        var loadedPromise = $q.defer();

        exports.items = [];

        var request = function() {
            exports.items = [];
            $http({
                method: 'GET',
                url: envData.config.serverUrl + 'faq'
            }).success(function(response) {
                exports.items = response;
                common.isLoading = false;
                loadedPromise.resolve();
            }).error(function(error) {
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
