'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.projectApi
 * @description
 * # projectApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('projectApi', function($http, $log, $window, envData, $q, $rootScope, _, alertsService, imageApi, userApi, common, utils, ngDialog, $translate, resource, bowerData) {
        // AngularJS will instantiate a singleton by calling "new" on this function

        var exports = {};

        exports.get = function(id, params) {
            params = params || {};
            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'project/' + id,
                params: params
            });
        };

        exports.getPublic = function(queryParams, queryParams2) {

            //Todo queryParams2 -> search by username
            $log.debug(queryParams2);

            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'project',
                params: queryParams
            });

        };

        exports.getPublicCounter = function(queryParams, queryParams2) {
            angular.extend(queryParams, {
                'count': '*'
            });
            return exports.getPublic(queryParams, queryParams2);
        };

        exports.getMyProjects = function(queryParams) {

            var myProjectArray = [],
                params = {
                    'page': 0,
                    'pageSize': 30
                };
            //    'sort': {
            //        '_updatedAt': 'desc'
            //    },

            queryParams = queryParams || {};
            _.extend(params, queryParams);

            return resource.getAll('project/me', params, myProjectArray);
        };

        exports.getMySharedProjects = function(queryParams) {

            var myProjectArray = [],
                params = {
                    'page': 0,
                    'pageSize': 30
                };
            //'sort': {
            //    '_updatedAt': 'desc'
            //},

            queryParams = queryParams || {};
            _.extend(params, queryParams);

            return resource.getAll('project/shared', params, myProjectArray);
        };

        exports.save = function(dataproject) {
            return $http({
                method: 'POST',
                url: envData.config.serverUrl + 'project',
                data: dataproject
            });
        };

        exports.update = function(idProject, dataproject) {
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + idProject,
                data: dataproject
            });
        };

        exports.publish = function(idProject) {
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + idProject + '/publish'
            });
        };

        exports.private = function(idProject) {
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + idProject + '/private'
            });
        };

        exports.shareWithUsers = function(idProject, userEmails) {
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'project/' + idProject + '/share',
                data: userEmails
            });
        };

        exports.delete = function(idProject) {
            return $http({
                method: 'DELETE',
                url: envData.config.serverUrl + 'project/' + idProject
            });
        };

        //---------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------

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

        exports.getCleanProject = function(projectRef) {
            var cleanProject = _.cloneDeep(projectRef);
            delete cleanProject._id;
            delete cleanProject._acl;
            delete cleanProject.creatorId;
            delete cleanProject.creatorUsername;
            delete cleanProject._createdAt;
            delete cleanProject._updatedAt;
            delete cleanProject.links;
            delete cleanProject.exportedFromBitbloqOffline;
            delete cleanProject.bitbloqOfflineVersion;
            return cleanProject;
        };

        exports.download = function(projectRef) {
            var project = exports.getCleanProject(projectRef);
            project.bloqsVersion = bowerData.dependencies.bloqs;

            var filename = utils.removeDiacritics(projectRef.name, undefined, $translate.instant('new-project'));

            utils.downloadFile(filename.substring(0, 30) + '.json', JSON.stringify(project), 'application/json');
        };

        exports.downloadIno = function(project, code) {
            code = code || project.code;
            var name = project.name;
            //Remove all diacritics
            name = utils.removeDiacritics(name, undefined, $translate.instant('new-project'));

            utils.downloadFile(name.substring(0, 30) + '.ino', code, 'text/plain;charset=UTF-8');
        };

        exports.generateShortUrl = function(longUrl) {
            return $http({
                method: 'POST',
                url: 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyA4NIAP4k3TA0kpo6POxWcS_2-Rpj_JaoE',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                data: {
                    longUrl: longUrl
                },
                skipAuthorization: true
            });
        };

        exports.isShared = function(project) {
            var found = false,
                i = 0,
                propertyNames = Object.getOwnPropertyNames(project._acl);
            while (!found && (i < propertyNames.length)) {
                if (propertyNames[i] !== 'ALL' && common.user && propertyNames[i].split('user:')[1] !== common.user._id) {
                    found = true;
                }
                i++;
            }
            return found;
        };

        return exports;
    });