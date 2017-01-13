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
            assignGroups: assignGroups,
            canUpdate: canUpdate,
            clone: clone,
            delete: deleteExercise,
            get: get,
            getTask: getTask,
            save: save,
            update: update,
            updateTask: updateTask
        };


        function assignGroups(idExercise, groups) {
            return $http({
                method: 'PUT',
                url: envData.config.centerModeUrl + 'exercise/' + idExercise + '/assign',
                data: groups
            });
        }

        function assignGroup(idExercise, groupId, groupCalendar) {
            return $http({
                method: 'PUT',
                url: envData.config.centerModeUrl + 'exercise/' + idExercise + '/assign',
                data: {
                    groupId: groupId,
                    calendar: groupCalendar
                }
            });
        }

        function canUpdate(idExercise) {
            return $http({
                method: 'HEAD',
                url: envData.config.centerModeUrl + 'exercise/' + idExercise + '/owner'
            });
        }

        function clone(idExercise, name) {
            return $http({
                method: 'PUT',
                url: envData.config.centerModeUrl + 'exercise/' + idExercise + '/clone',
                data: {
                    name: name
                }
            });
        }

        function deleteExercise(idExercise) {
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

        function getTask(id) {
            return $http({
                method: 'GET',
                url: envData.config.centerModeUrl + 'task/' + id
            });
        }

        function save(dataExercise, teacherId) {
            if (teacherId) {
                dataExercise.teacher = teacherId;
            }
            return $http({
                method: 'POST',
                url: envData.config.centerModeUrl + 'exercise',
                data: dataExercise
            });
        }

        function update(idExercise, dataExercise) {
            return $http({
                method: 'PUT',
                url: envData.config.centerModeUrl + 'exercise/' + idExercise,
                data: dataExercise
            });
        }

        function updateTask(idTask, dataTask) {
            return $http({
                method: 'PUT',
                url: envData.config.centerModeUrl + 'task/' + idTask,
                data: dataTask
            });
        }


        return exerciseApi;
    });
