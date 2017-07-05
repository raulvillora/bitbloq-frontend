'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('HeaderCtrl', function($scope, $location, $rootScope, _, ngDialog, userApi, commonModals, $document, $translate, centerModeApi, alertsService, utils) {
        $scope.userApi = userApi;
        $scope.utils = utils;
        $scope.translate = $translate;
        $scope.commonModals = commonModals;
        $scope.showHeader = false;
        $scope.common.session.save = false;

        $scope.createCenter = function() {
            function tryCenter() {
                modalOptions.title = 'centerMode_modal_createCenter-title';
                modalOptions.mainText = 'centerMode_modal_createCenter-mainText';
                modalOptions.confirmButton = 'create_button';
                modalOptions.type = 'form';
                modalOptions.extraButton = '';
                modalOptions.confirmAction = createCenter;
                modalOptions.center = {};

                function createCenter() {
                    if (modalOptions.center.name && modalOptions.center.location && modalOptions.center.telephone) {
                        centerModeApi.createCenter(modalOptions.center).then(function() {
                            ngDialog.close(centerModal);
                            $scope.common.userRole = 'headmaster';
                            $location.url('/center-mode/center');
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
                    } else {
                        modalOptions.errors = true;
                    }
                }
            }

            var modalOptions = $rootScope.$new();

            _.extend(modalOptions, {
                title: 'centerMode_modal_createCenterTitle',
                contentTemplate: 'views/modals/centerMode/activateCenterMode.html',
                customClass: 'modal--information',
                mainText: 'centerMode_modal_createCenter-introText',
                confirmButton: 'centerMode_modal_confirmation-button',
                confirmAction: tryCenter,
                modalButtons: true,
                type: 'information',
                errors: false
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
            $location.url('/');
        };

        $scope.openMenu = function($event) {
            $event.stopPropagation();
            $scope.showHeader = !$scope.showHeader;
        };

        function clickDocumentHandler() {
            if ($scope.showHeader) {
                $scope.showHeader = false;
                $scope.$apply();
            }
        }

        $document.on('click', clickDocumentHandler);

        $scope.$on('$destroy', function() {
            $document.off('click', clickDocumentHandler);
        });


    });
