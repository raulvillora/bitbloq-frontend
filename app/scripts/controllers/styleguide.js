'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:StylesCtrl
 * @description
 * # StylesCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('StylesCtrl', function($scope, $timeout, $rootScope, $log, ngDialog, _, alertsService) {

        $scope.test = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'];
        $scope.sampleCheckbox = true;
        $scope.mifuncion = function(item) {
            $log.debug(item);
        };
        $scope.validate = function(evt) {
            $scope.validationOk = false;
            $(evt.currentTarget).on('keyup', function() {
                var validateCb;
                if (!this.value) {
                    $timeout.cancel(validateCb);
                    $scope.validating = false;
                    $scope.validationOk = false;
                    $scope.validationKo = false;
                    $(evt.currentTarget).off('keypress');
                    $scope.$apply();
                    return;
                }
                $scope.validating = true;
                $scope.$apply();
                validateCb = $timeout(function() {
                    $scope.validating = false;
                    $scope.validationOk = true;
                    $scope.$apply();
                    $(evt.currentTarget).off('keypress');
                }, 3000);
            });
        };
        $scope.simpleModal = function() {

            var parent = $rootScope,
                modalOptions = parent.$new();

            _.extend(modalOptions, {
                title: 'hola que ase',
                contentTemplate: 'views/modals/password-reset.html',
                confirmButton: 'modal-reset-password-button-ok'
            });

            ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container password-reset--modal',
                scope: modalOptions,
                showClose: false
            });
        };

        $scope.confirmModal = function() {

            var confirmAction = function() {
                    ngDialog.close('ngdialog1');
                },
                parent = $rootScope,
                modalOptions = parent.$new();

            _.extend(modalOptions, {
                title: 'hola que ase',
                confirmOnly: true,
                buttonConfirm: 'modal-button-ok',
                buttonReject: 'modal-button-cancel',
                confirmAction: confirmAction
            });

            ngDialog.open({
                template: '/views/modal.html',
                className: 'modal--container',
                scope: modalOptions,
                showClose: false
            });
        };

        $scope.confirmRejectModal = function() {

            var confirmAction = function() {
                    ngDialog.close('ngdialog1');
                },
                parent = $rootScope,
                modalOptions = parent.$new();

            _.extend(modalOptions, {
                title: 'hola que ase',
                confirmOrReject: true,
                buttonConfirm: 'modal-button-ok',
                buttonReject: 'modal-button-cancel',
                confirmAction: confirmAction
            });

            ngDialog.open({
                template: '/views/modal.html',
                className: 'modal--container',
                scope: modalOptions,
                showClose: false
            });
        };

        $scope.alertsService = alertsService;
        $scope.userProjects = [{
            name: 'posi'
        }, {
            name: 'posno'
        }, {
            name: 'postalvez'
        }, {
            name: 'posnah'
        }, {
            name: 'amarosa'
        }, {
            name: 'amparo'
        }, {
            name: 'has tirao la fruta?'
        }, {
            name: 'AMAROSA!!!'
        }, {
            name: 'posi, NO!'
        }, {
            name: 'yiiiii'
        }];
    });