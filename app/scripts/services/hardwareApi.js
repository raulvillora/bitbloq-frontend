'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.hardwareApi
 * @description
 * # hardwareApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('hardwareApi', function($http, $q, envData) {

        var hardwareApi = {
            getAll: getAll,
            getComponents: getComponents,
            getRobots: getRobots,
            getBoards: getBoards,
            getKits: getKits
        };

        /******************************
         ***** PRIVATE FUNCTIONS ******
         ******************************/

        function getAll() {
            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'hardware'
            });
        }

        function getComponents() {
            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'component'
            });
        }

        function getRobots() {
            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'robot'
            });
        }

        function getBoards() {
            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'board'
            });
        }

        function getKits() {
            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'kit'
            });
        }

        return hardwareApi;
    });
