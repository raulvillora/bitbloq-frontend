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
                modalOptions.title = 'centerMode_modal_createCenter-title';
                modalOptions.mainText = 'centerMode_modal_createCenter-mainText';
                modalOptions.confirmButton = 'centerMode_button_createCenter-confirm';
                modalOptions.type = 'form';
                modalOptions.extraButton = '';
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
                            type: 'ok',
                            time: 5000
                        });
                    }).catch(function() {
                        alertsService.add({
                            text: 'centerMode_alert_createCenter-Error',
                            id: 'createCenter',
                            type: 'ko'
                        });
                    });
                }
            }

            function studentAction() {
                modalOptions.title = 'centerMode_button_createStudentProfile-title';
                modalOptions.mainText = 'centerMode_modal_createStudentProfile-mainText';
                modalOptions.confirmButton = 'centerMode_button_createStudentProfile-confirm';
                modalOptions.extraButton = '';
                modalOptions.textContent = 'Podrás registrarte en los grupos con un ID que el profesor te indique para así poder ver los ejercicios.';
                modalOptions.type = '';
                modalOptions.confirmAction = createStudent;


                function createStudent() {
                    console.log(modalOptions.center);
                    userApi.update({studentMode: true}).then(function() {
                        ngDialog.close(centerModal);
                        $scope.userRole = 'student';
                        alertsService.add({
                            text: 'centerMode_alert_createStudent',
                            id: 'createStudent',
                            type: 'ok',
                            time: 5000
                        });
                    }).catch(function() {
                        alertsService.add({
                            text: 'centerMode_alert_createStudent-Error',
                            id: 'createCenter',
                            type: 'ko'
                        });
                    });
                }
            }

            var modalOptions = $rootScope.$new();

            _.extend(modalOptions, {
                title: 'centerMode_modal_createCenterTitle',
                contentTemplate: 'views/modals/createCenter.html',
                customClass: 'modal--information',
                mainText: 'centerMode_modal_createCenter-introText',
                confirmButton: 'centerMode_button_createCenter-student',
                confirmAction: studentAction,
                extraButton: 'centerMode_button_createCenter-try',
                extraAction: tryCenter,
                modalButtons: true,
                type: 'information'
            });

            var centerModal = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--centerMode',
                scope: modalOptions

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
