'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.imageApi
 * @description
 * # imageApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('imageApi', function($http, envData) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        var data = {};

        data.save = function(idImage, file, collection) {
            collection = collection || 'project';

            var formData = new FormData();
            formData.append('file', file);

            return $http.post(envData.config.serverUrl + 'image/' + collection + '/' + idImage, formData, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                });
        };

        return data;
    });
