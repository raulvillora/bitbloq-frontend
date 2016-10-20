'use strict';
angular
    .module('bitbloqApp')
    .service('centerModeApi', function($http, envData) {

        var centerModeApi = {
            addTeachers: addTeachers,
            deleteTeacher: deleteTeacher,
            createGroup: createGroup
        };

        function addTeachers(teachers, centerId) {
            return $http({
                method: 'POST',
                url: envData.config.serverUrl + 'centerMode/center/' + centerId + '/teacher',
                data: teachers
            });
        }

        function createGroup(name, accessId) {
            return $http({
                method: 'POST',
                url: envData.config.serverUrl + 'centerMode/center/group',
                data: {
                    group: name,
                    accessId: accessId
                }
            });
        }

        function deleteTeacher(teacher) {
            return $http({
                method: 'DELETE',
                url: envData.config.serverUrl + 'centerMode/center/teacher',
                data: teacher
            });
        }

        return centerModeApi;
    });
