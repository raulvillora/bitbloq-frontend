'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('HeaderCtrl', function($scope, $location, userApi, commonModals, $document, $translate, $localStorage) {
        $scope.userApi = userApi;

        function clickDocumentHandler() {
            if ($scope.showHeader) {
                $scope.showHeader = false;
                $scope.$apply();
            }
        }

        $scope.translate = $translate;
        $scope.commonModals = commonModals;
        $scope.showHeader = false;
        $scope.diwoURLCourse = 'http://diwo.bq.com/' + $scope.common.langToDiwo[$translate.use().split('-')[0]] + '/course/aprende-robotica-y-programacion-con-bitbloq-2/';
        $scope.common.session.save = false;

        $scope.logout = function() {
            userApi.logout();
            $scope.common.setUser(null);
            $localStorage.projectsChange = false;
            $location.path('/');
        };

        $scope.openMenu = function($event) {
            $event.stopPropagation();
            $scope.showHeader = !$scope.showHeader;
        };

        $document.on('click', clickDocumentHandler);

        $scope.$on('$destroy', function() {
            $document.off('click', clickDocumentHandler);
        });

        // $scope.$watch('common.user.language', function(newValue, oldValue) {
        //     if (newValue && newValue !== oldValue) {
        //         $scope.diwoURLCourse = 'http://diwo.bq.com/' + $scope.common.langToDiwo[$translate.use().split('-')[0]] + '/course/aprende-robotica-y-programacion-con-bitbloq-2/';
        //     }
        // });
    });
