'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:Under14AuthorizationCtrl
 * @description
 * # Under14AuthorizationCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('Under14AuthorizationCtrl', function($scope, $routeParams, userApi, alertsService, $translate, $location) {
        console.log('Under14AuthorizationCtrl');

        function goToSupport() {

            if (alertId) {
                alertsService.close(alertId);
            }
            $location.path('bitbloq-help');
        }

        $scope.acceptSubmit = function(form) {
            console.log('submit');
            alertsService.add({
                text: 'under14-saving-data',
                id: 'under14-auth',
                type: 'loading'
            });
            if (true) {
                userApi.authorizeUnder14User($scope.user, updateUserToken).then(function(response) {
                    console.log(response);
                    alertsService.add({
                        text: 'under14-auth-done',
                        id: 'under14-auth',
                        type: 'ok',
                        time: 5000
                    });
                }).catch(function(error) {
                    alertId = alertsService.add({
                        text: error.data + ' : ' + $translate.instant('error-under14-auth'),
                        id: 'under14-auth',
                        type: 'error',
                        linkText: $translate.instant('from-here'),
                        link: goToSupport
                    });
                });
            }
        };

        $scope.cancelSubmit = function(form) {
            console.log('cancel');
            userApi.authorizeUnder14User({
                authorized: false
            }, updateUserToken).then(function(response) {
                console.log(response);
                alertsService.add({
                    text: 'under14-auth-cancelbyuser',
                    id: 'under14-auth',
                    type: 'ok',
                    time: 5000
                });
            }).catch(function(error) {
                alertId = alertsService.add({
                    text: error.data + ' : ' + $translate.instant('error-under14-auth'),
                    id: 'under14-auth',
                    type: 'error',
                    linkText: $translate.instant('from-here'),
                    link: goToSupport
                });
            });
        };

        var alertId, updateUserToken;

        $scope.user;
        $scope.showForm = false;

        alertsService.add({
            text: 'under14-getting-data',
            id: 'under14-auth',
            type: 'loading'
        });
        userApi.getUnder14User($routeParams.token).then(function(response) {
            $scope.showForm = true;
            console.log(response);
            $scope.user = response.data.user;
            updateUserToken = response.data.token;
        }).catch(function(error) {
            console.log(error);
            alertId = alertsService.add({
                text: error.data + ' : ' + $translate.instant('error-under14-auth'),
                id: 'under14-auth',
                type: 'error',
                linkText: $translate.instant('from-here'),
                link: goToSupport
            });
            $location.path('');
        })
    });