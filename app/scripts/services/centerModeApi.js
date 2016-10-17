'use strict';
angular
    .module('bitbloqApp')
    .service('centerModeApi', function($http, envData) {

        var centerModeApi = {
            addTeachers: addTeachers,
            deleteTeacher: deleteTeacher
        };


        function addTeachers(teachers) {
            return $http({
                method: 'PUT',
                url: envData.config.serverUrl + 'center/teacher',
                data: {
                    teachers: teachers
                }
            });
        }

        function deleteTeacher(teacher) {
            return $http({
                method: 'DELETE',
                url: envData.config.serverUrl + 'center/teacher',
                data: {
                    teacher: teacher
                }
            });
        }

        return centerModeApi;
    });
