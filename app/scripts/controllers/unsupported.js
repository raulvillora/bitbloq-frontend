'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:UnsupportedCtrl
 * @description
 * # UnsupportedCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('UnsupportedCtrl', function($scope, $translate, $routeParams, $location, $sessionStorage) {

        $scope.translate = $translate;

        $sessionStorage.hasBeenWarnedAboutCompatibility = true;

        $scope.continueToBitbloq = function() {
            $location.path($scope.common.continueToURL);
        };

        switch ($routeParams.id) {
            case 'desktop':
                $scope.device = 'desktop';
                break;
            case 'tablet':
                $scope.device = 'tablet';
                break;
            case 'phone':
                $scope.device = 'phone';
                break;
            default:
                throw 'Not a valid route';
        }

    });
