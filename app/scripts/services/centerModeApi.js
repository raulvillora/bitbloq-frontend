'use strict';
angular
    .module('bitbloqApp')
    .service('centerModeApi', function($http, envData) {

        var centerModeApi = {
            addTeachers: addTeachers,
            createCenter: createCenter,
            createGroup: createGroup,
            deleteGroup: deleteGroup,
            deleteStudent: deleteStudent,
            deleteTask: deleteTask,
            deleteTeacher: deleteTeacher,
            getExercises: getExercises,
            getExercisesCount: getExercisesCount,
            getGroup: getGroup,
            getGroups: getGroups,
            getGroupsByExercise: getGroupsByExercise,
            getMyCenter: getMyCenter,
            getMyCentersAsTeacher: getMyCentersAsTeacher,
            getMyRole: getMyRole,
            getTeacher: getTeacher,
            getTeachers: getTeachers,
            isHeadmaster: isHeadmaster,
            registerInGroup: registerInGroup,
            updateGroup: updateGroup
        };

        function addTeachers(teachers, centerId) {
            return $http({
                method: 'POST',
                url: envData.config.centerModeUrl + 'center/' + centerId + '/teacher',
                data: teachers
            });
        }

        function createCenter(center) {
            return $http({
                method: 'POST',
                url: envData.config.centerModeUrl + 'center',
                data: center
            });
        }

        function createGroup(name, teacherId, centerId) {
            return $http({
                method: 'POST',
                url: envData.config.centerModeUrl + 'group',
                data: {
                    name: name,
                    statusId: 'open',
                    teacher: teacherId,
                    center: centerId,
                    student: []
                }
            });
        }

        function deleteGroup(groupId) {
            return $http({
                method: 'DELETE',
                url: envData.config.centerModeUrl + 'group/' + groupId
            });
        }

        function deleteStudent(studentId, groupId) {
            return $http({
                method: 'DELETE',
                url: envData.config.centerModeUrl + 'group/' + groupId + '/student/' + studentId
            });
        }

        function deleteTask(taskId) {
            return $http({
                method: 'DELETE',
                url: envData.config.centerModeUrl + 'task/' + taskId
            });
        }

        function deleteTeacher(teacherId, centerId) {
            return $http({
                method: 'DELETE',
                url: envData.config.centerModeUrl + 'center/' + centerId + '/teacher/' + teacherId
            });
        }

        function getExercises(teacherId, params) {
            if (teacherId) {
                return $http({
                    method: 'GET',
                    url: envData.config.centerModeUrl + 'exercise/teacher/' + teacherId,
                    params: params
                });
            } else {
                return $http({
                    method: 'GET',
                    url: envData.config.centerModeUrl + 'exercise',
                    params: params
                });
            }
        }

        function getExercisesCount(teacherId, paramsSearch) {
            if (teacherId) {
                return $http({
                    method: 'GET',
                    url: envData.config.centerModeUrl + 'exercise/teacher/' + teacherId + '/count',
                    params: paramsSearch
                });
            } else {
                return $http({
                    method: 'GET',
                    url: envData.config.centerModeUrl + 'exercise/count',
                    params: paramsSearch
                });
            }
        }

        function getGroup(groupId) {
            return $http({
                method: 'GET',
                url: envData.config.centerModeUrl + 'group/' + groupId
            });
        }

        function getGroups(role, teacherId, centerId) {
            if (teacherId) {
                return $http({
                    method: 'GET',
                    url: envData.config.centerModeUrl + 'group/teacher/' + teacherId
                });
            } else if (centerId) {
                return $http({
                    method: 'GET',
                    url: envData.config.centerModeUrl + 'group/center/' + centerId
                });
            } else {
                return $http({
                    method: 'GET',
                    url: envData.config.centerModeUrl + 'group/',
                    params: {
                        role: role
                    }
                });
            }
        }

        function getGroupsByExercise(exerciseId) {
            return $http({
                method: 'GET',
                url: envData.config.centerModeUrl + 'assignment/exercise/' + exerciseId
            });
        }

        function getMyCenter() {
            return $http({
                method: 'GET',
                url: envData.config.centerModeUrl + 'center/me'
            });
        }

        function getMyCentersAsTeacher() {
            return $http({
                method: 'GET',
                url: envData.config.centerModeUrl + 'center/teacher/me'
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

        function isHeadmaster() {
            return $http({
                method: 'HEAD',
                url: envData.config.centerModeUrl + 'user/headmaster'
            });
        }

        function registerInGroup(groupId) {
            return $http({
                method: 'HEAD',
                url: envData.config.centerModeUrl + 'group/' + groupId + '/register'
            });
        }

        function updateGroup(group) {
            return $http({
                method: 'PUT',
                url: envData.config.centerModeUrl + 'group/' + group._id,
                data: group
            });
        }

        return centerModeApi;
    });
