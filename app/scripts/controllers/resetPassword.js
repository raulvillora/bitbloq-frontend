/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:ResetPasswordCtrl
 * @description
 * # ResetPasswordCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('ResetPasswordCtrl', function($scope, $cookieStore, $routeParams, User, alertsService, $location, _) {
        var token = $routeParams.token;

        $cookieStore.remove('token');
        $cookieStore.put('token', token);

        $scope.createPassword = function(form) {

            var password = form.passwordMain.$modelValue,
                confirmPassword = form.passwordRepeat.$modelValue;
            $scope.errorPassword = false;

            if (_.isEmpty(form.$error)) {
                if (password === confirmPassword) {
                    User.get().$promise.then(function(user) {
                        User.changePassword({
                            id: user._id
                        }, {
                            newPassword: password
                        }, function() {
                            alertsService.add('recovery-create-password-ok', 'password', 'ok', 5000);
                            $location.path('login');
                        }, function() {
                            alertsService.add('recovery-create-password-error', 'password', 'warning');

                        });
                    }, function(err) {
                        console.log('error getting the user: ', err);
                    });

                } else {
                    $scope.errorPassword = true;
                }
            }
        };

        $scope.errorPassword = false;
        $scope.common.section = 'recovery';
    });
