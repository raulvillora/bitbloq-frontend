'use strict';
angular
    .module('bitbloqApp')
    .service('centerModeApi', function($http, envData) {

        var centerModeApi = {
            addTeachers: addTeachers,
            deleteTeacher: deleteTeacher,
            createGroup: createGroup,
            getTeachers: getTeachers,
            getMyCenter: getMyCenter,
            isHeadMaster: isHeadMaster
        };

        
        function addTeachers(teachers, centerId) {
            return $http({
                method: 'POST',
                url: envData.config.centerModeUrl + 'center/' + centerId + '/teacher',
                data: teachers
            });
        }

        function createGroup(name, accessId) {
            return $http({
                method: 'POST',
                url: envData.config.centerModeUrl + 'center/group',
                data: {
                    group: name,
                    accessId: accessId
                }
            });
        }

        function deleteTeacher(teacherId, centerId) {
            return $http({
                method: 'DELETE',
                url: envData.config.centerModeUrl + 'center/' + centerId + '/teacher/' + teacherId
            });
        }

        function getMyCenter(){
            return $http({
                method: 'GET',
                url: envData.config.centerModeUrl + 'center/me'
            });
        }

        function getTeachers(centerId) {
            return $http({
                method: 'GET',
                url: envData.config.centerModeUrl + 'center/' + centerId + '/teacher'
            });
        }

        function isHeadMaster() {
            return $http({
                method: 'HEAD',
                url: envData.config.centerModeUrl + 'center/headMaster'
            });
        }

        return centerModeApi;
    });
