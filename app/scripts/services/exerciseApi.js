'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.exerciseApi
 * @description
 * # exerciseApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('exerciseApi', function($http, $log, envData) {

        var exerciseApi = {
            clone: clone,
            delete: deleteExercise,
            get: get,
            save: save,
            update: update
        };


        function clone(idExercise, name) {
            return $http({
                method: 'PUT',
                url: envData.config.centerModeUrl + 'exercise/' + idExercise + '/clone',
                data: {
                    name: name
                }
            });
        }

        function deleteExercise(idExercise){
            return $http({
                method: 'DELETE',
                url: envData.config.centerModeUrl + 'exercise/' + idExercise
            });
        }

        function get(id, params) {
            params = params || {};
            return $http({
                method: 'GET',
                url: envData.config.centerModeUrl + 'exercise/' + id,
                params: params
            });
        }

        function save(dataExercise) {
            return saveRequest({
                method: 'POST',
                url: envData.config.centerModeUrl + 'exercise',
                data: dataExercise
            });
        }

        function update(idExercise, dataExercise) {
            return saveRequest({
                method: 'PUT',
                url: envData.config.centerModeUrl + 'exercise/' + idExercise,
                data: dataExercise
            });
        }


        return exerciseApi;
    });
