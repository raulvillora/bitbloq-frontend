'use strict';
/*jshint quotmark: false */

/**
 * @ngdoc service
 * @name bitbloqApp.bloqsApi
 * @description
 * # bloqsApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('bloqsApi', function(envData, $http, $log, $q) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        var exports = {};

        var loadedBloqsPromise = $q.defer();

        exports.schemas = {};

        var requestBloqs = function(pageSize, page) {

            $http({
                method: 'GET',
                //                url: envData.config.serverUrl + 'bloq',
                url: 'http://localhost:9000/bower_components/bloqs/dist/bloqsmap.json',

                params: {
                    'pageSize': pageSize,
                    'page': page
                }
            }).success(function(response) {

                /*for (var i = 0; i < response.length; i++) {
                    if (exports.schemas[response[i].name]) {
                        $log.debug('dupli', response[i].name, response[i]);
                    }
                    exports.schemas[response[i].name] = response[i];
                }

                if (response.length < pageSize) {
                    exports.loaded = true;
                    loadedBloqsPromise.resolve();
                } else {
                    requestBloqs(pageSize, ++page);
                }*/
                exports.schemas = response;
                loadedBloqsPromise.resolve();

            }).error(function(error) {
                loadedBloqsPromise.reject(error);
            });
        };

        exports.itsLoaded = function() {
            return loadedBloqsPromise.promise;
        };

        requestBloqs(90, 0);

        return exports;
    });