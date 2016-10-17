(function() {
    'use strict';
    /**
     * @ngdoc function
     * @name bitbloqApp.controller:forumCtrl
     * @description
     * # forumCtrl
     * Controller of the bitbloqApp
     */
    angular.module('bitbloqApp')
        .controller('CenterCtrl', function forumCtrl($log, $scope) {
            $scope.instance = [
                {
                    name: 'Pepito grillo',
                    email: 'pepito@grillo.com',
                    groups: '4',
                    students: '32'
                }, {
                    name: 'Caperucita roja',
                    email: 'caperucita@roja.com',
                    groups: '4',
                    students: '30'
                }, {
                    name: 'El principe azul',
                    email: 'el.principe@azul.com',
                    groups: '10',
                    students: '105'
                }
            ];

            $scope.newTeacher = function(){

            };
        });

})();
