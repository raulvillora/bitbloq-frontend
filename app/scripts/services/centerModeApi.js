'use strict';
angular
    .module('bitbloqApp')
    .service('centerModeApi', function($http, envData) {

        var centerModeApi = {
            addTeachers: addTeachers,
            deleteTeacher: deleteTeacher,
            createGroup: createGroup,
            getTeachers: getTeachers
        };

        var centerLocalId = '580818d0a8acf9a4be2f9458';

        function addTeachers(teachers, centerId) {
            centerId = centerLocalId;
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

        function deleteTeacher(teacherId, centerId) {
            centerId = centerLocalId;
            return $http({
                method: 'DELETE',
                url: envData.config.serverUrl + 'centerMode/center/' + centerId + '/teacher/' + teacherId
            });
        }

        function getTeachers(centerId) {
            centerId = centerLocalId;
            return $http({
                method: 'GET',
                url: envData.config.serverUrl + 'centerMode/center/' + centerId + '/teacher'
            });
        }

        return centerModeApi;
    });
