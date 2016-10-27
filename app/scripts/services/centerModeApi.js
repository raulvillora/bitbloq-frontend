'use strict';
angular
    .module('bitbloqApp')
    .service('centerModeApi', function($http, envData) {

        var centerModeApi = {
            addTeachers: addTeachers,
            deleteTeacher: deleteTeacher,
            createGroup: createGroup,
            getGroups: getGroups,
            getMyCenter: getMyCenter,
            getMyRole: getMyRole,
            getTeacher: getTeacher,
            getTeachers: getTeachers,
            isHeadMaster: isHeadMaster
        };


        function addTeachers(teachers, centerId) {
            return $http({
                method: 'POST',
                url: envData.config.centerModeUrl + 'center/' + centerId + '/teacher',
                data: teachers
            });
        }

        function createGroup(name, accessId, teacherId, centerId) {
            return $http({
                method: 'POST',
                url: envData.config.centerModeUrl + 'group',
                data: {
                    name: name,
                    statusId: 'open',
                    accessId: accessId,
                    teacher: teacherId,
                    center: centerId,
                    student: []
                }
            });
        }

        function deleteTeacher(teacherId, centerId) {
            return $http({
                method: 'DELETE',
                url: envData.config.centerModeUrl + 'center/' + centerId + '/teacher/' + teacherId
            });
        }

        function getGroups(teacherId) {
            if (teacherId) {
                return $http({
                    method: 'GET',
                    url: envData.config.centerModeUrl + 'group/teacher/' + teacherId
                });
            } else {
                return $http({
                    method: 'GET',
                    url: envData.config.centerModeUrl + 'group'
                });
            }
        }

        function getMyCenter() {
            return $http({
                method: 'GET',
                url: envData.config.centerModeUrl + 'center/me'
            });
        }

        function getMyRole() {
            return $http({
                method: 'GET',
                url: envData.config.centerModeUrl + 'user/role'
            });
        }

        function getTeacher(teacherId, centerId) {
            return $http({
                method: 'GET',
                url: envData.config.centerModeUrl + 'center/' + centerId + '/teacher/' + teacherId
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
                url: envData.config.centerModeUrl + 'user/headMaster'
            });
        }

        return centerModeApi;
    });
