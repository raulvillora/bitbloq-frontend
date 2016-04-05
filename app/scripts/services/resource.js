(function() {
    /*jshint bitwise: false*/
    'use strict';

    /**
     * @ngdoc service
     * @name bitbloqApp.allResources
     * @description
     * # Common service to create common requests.
     * Service in the bitbloqApp.
     */
    angular.module('bitbloqApp').factory('resource', resourceApi);

    function resourceApi($http, $q, utils, envData) {

        var exports = {
            getFile: getFile,
            get: get,
            getAll: getAll
        };

        return exports;

        function getFile(file) {

            var deferred = $q.defer();

            //TODO move the url to config, and maybe return the $http promise directly if we don't want to do
            //anything to the data
            $http.get(file).then(function(response) {
                deferred.resolve(response.data);
            }).catch(function(err) {
                deferred.reject(err);
            });

            return deferred.promise;

        }

        function get(endpoint, queryParams) {

            queryParams = queryParams || {};

            return $http({
                method: 'GET',
                url: envData.config.gCloudEndpoint + endpoint,
                params: queryParams
            });

        }

        function getAll(endpoint, queryParams, resultArray, promise) {
            var defered = promise || $q.defer();
            resultArray = resultArray || [];
            queryParams = queryParams || {};

            get(endpoint, queryParams).then(function(response) {
                resultArray = resultArray.concat(response.data);
                if (response.data.length === queryParams.pageSize) {
                    queryParams.page++;
                    getAll(endpoint, queryParams, resultArray, defered);
                } else {
                    defered.resolve(resultArray);
                }
            }, function(error) {
                defered.reject(error.data);
            });
            return defered.promise;
        }
    }

})();

