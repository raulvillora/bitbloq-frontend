'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.projectApi
 * @description
 * # projectApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('projectApi', function($http, $log, envData, $q, _, alertsService) {

        var exports = {};

        function saveRequest(params) {
            return $http(params)
                .then(function(response) {
                    return response;
                }, function(error) {
                    $log.debug('Save error: ', error);
                    if (error.status === 405 || error.status === 401) {
                        alertsService.add({
                            text: 'session-expired',
                            id: 'session',
                            type: 'warning'
                        });
                    }
                    return error;
                });
        }

        //Public functions
        exports.addDownload = function(idProject) {
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + idProject + '/download'
            });
        };

        exports.clone = function(idProject, name) {
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + idProject + '/clone',
                data: {
                    name: name
                }
            });
        };

        exports.delete = function(idProject) {
            return $http({
                method: 'DELETE',
                url: envData.config.serverUrl + 'project/' + idProject
            });
        };

        exports.get = function(id, params) {
            params = params || {};
            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'project/' + id,
                params: params
            });
        };

        exports.getPublic = function(queryParams) {
            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'project',
                params: queryParams
            });

        };

        exports.getPublicCounter = function(queryParams) {
            angular.extend(queryParams, {
                'count': '*'
            });
            return exports.getPublic(queryParams);
        };

        exports.getMyProjectsCounter = function(queryParams) {
            var params = queryParams ? queryParams : {};
            angular.extend(params, {
                'count': '*'
            });
            return exports.getMyProjects(params);
        };

        exports.getMyTrashProjectsCounter = function(queryParams) {
            var params = queryParams ? queryParams : {};
            angular.extend(params, {
                'count': '*'
            });
            return exports.getMyTrash(params);
        };

        exports.getMySharedProjectsCounter = function(queryParams) {
            var params = queryParams ? queryParams : {};
            angular.extend(params, {
                'count': '*'
            });
            return exports.getMySharedProjects(params);
        };

        exports.getMyProjects = function(queryParams) {
            var params = {
                'page': queryParams ? queryParams.page : 0,
                'pageSize': 20
            };

            queryParams = queryParams || {};
            _.extend(params, queryParams);

            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'project/me',
                params: params
            });
        };

        exports.getMySharedProjects = function(queryParams) {
            var params = {
                'page': queryParams ? queryParams.page : 0,
                'pageSize': 20
            };

            queryParams = queryParams || {};
            _.extend(params, queryParams);

            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'project/shared',
                params: params
            });
        };


        exports.getMyTrash = function(queryParams) {
            var params = {
                'page': queryParams ? queryParams.page : 0,
                'pageSize': 20
            };

            queryParams = queryParams || {};
            _.extend(params, queryParams);

            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'project/trash',
                params: params
            });
        };

        exports.private = function(project) {
            var defered = $q.defer();
            $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + project._id + '/private'
            }).then(function(response) {
                delete project._acl.ALL;
                defered.resolve(response);
            }, function(error) {
                defered.reject(error);
            });
            return defered.promise;
        };

        exports.publish = function(project) {
            var defered = $q.defer();
            $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + project._id + '/publish'
            }).then(function(response) {
                project._acl.ALL = {
                    permission: 'READ',
                    properties: {
                        date: Date.now()
                    }
                };
                defered.resolve(response);
            }, function(error) {
                defered.reject(error);
            });
            return defered.promise;
        };

        exports.restore = function(idProject){
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + idProject + '/restore'
            });
        };

        exports.save = function(dataProject) {
            return saveRequest({
                method: 'POST',
                url: envData.config.serverUrl + 'project',
                data: dataProject
            });
        };

        exports.shareWithUsers = function(idProject, userEmails) {
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + idProject + '/share',
                data: userEmails
            });
        };

        exports.update = function(idProject, dataProject) {
            return saveRequest({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + idProject,
                data: dataProject
            });
        };

        //---------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------
        //---------------- SOCIAL NETWORK API ---------------------------------------------
        //---------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------

        exports.generateShortUrl = function(longUrl) {
            return $http({
                method: 'POST',
                url: 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyA4NIAP4k3TA0kpo6POxWcS_2-Rpj_JaoE',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: {
                    longUrl: longUrl
                },
                skipAuthorization: true
            });
        };

        exports.getShortURL = function(longUrl) {
            // Request short url
            return $http.post('https://www.googleapis.com/urlshortener/v1/url?key=' + envData.google.apikey, {
                longUrl: longUrl
            }).success(function(response) {
                return response.id;
            }).error(function(error) {
                return error.error.message;
            });
        };

        return exports;
    });