'use strict';
angular
    .module('bitbloqApp')
    .service('centerModeApi', function($http, envData) {

        var centerModeApi = {
            addTeachers: addTeachers,
            deleteTeacher: deleteTeacher,
            createGroup: createGroup
        };

        function addTeachers(teachers) {
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'center/teacher',
                data: teachers
            });
        }

        function createGroup(name, accessId) {
            return $http({
                method: 'POST',
                url: envData.config.serverUrl + 'center/group',
                data: {
                    group: name,
                    accessId: accessId
                }
            });
        }

        function deleteTeacher(teacher) {
            return $http({
                method: 'DELETE',
                url: envData.config.serverUrl + 'center/teacher',
                data: teacher
            });
        }

        return centerModeApi;
    });
