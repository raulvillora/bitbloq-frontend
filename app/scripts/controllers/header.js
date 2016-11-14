'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('HeaderCtrl', function($scope, $location, $rootScope, _, ngDialog, userApi, commonModals, $document, $translate, centerModeApi, alertsService) {
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
        $scope.common.session.save = false;
        $scope.common.userRole = 'student';

        $scope.activateCenterMode = function() {
            function tryCenter() {
                modalOptions.mainText = 'centerMode_modal_createCenter-mainText';
                modalOptions.confirmButton = 'centerMode_button_createCenter-confirm';
                modalOptions.information = false;
                modalOptions.confirmAction = createCenter;
                modalOptions.center = {};


                function createCenter() {
                    console.log(modalOptions.center);
                    centerModeApi.createCenter(modalOptions.center).then(function() {
                        ngDialog.close(centerModal);
                        $scope.userRole = 'headMaster';
                        alertsService.add({
                            text: 'centerMode_alert_createCenter',
                            id: 'createCenter',
                            type: 'ok'
                        });
                    });
                }
            }

            var modalOptions = $rootScope.$new();

            _.extend(modalOptions, {
                title: 'centerMode_modal_createCenterTitle',
                contentTemplate: 'views/modals/createCenter.html',
                mainText: 'centerMode_modal_createCenter-introText',
                confirmButton: 'centerMode_button_createCenter-try',
                confirmAction: tryCenter,
                modalButtons: true,
                information: true
            });

            var centerModal = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--input',
                scope: modalOptions,
                showClose: false

            });
        };

        $scope.logout = function() {
            userApi.logout();
            $scope.common.setUser(null);
            localStorage.projectsChange = false;
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

        $scope.common.itsUserLoaded().then(function() {
            centerModeApi.getMyRole().then(function(result) {
                $scope.common.userRole = result.data;
            });
        });
    });
