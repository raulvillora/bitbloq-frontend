'use strict';

/**
 * @ngdoc directive
 * @name bitbloqApp.directive:wysiwyg
 * @description
 * # wysiwyg
 */

angular.module('bitbloqApp')
    .directive('wysiwyg', function($log) {
        return {
            restrict: 'E',
            templateUrl: '../views/wysiwyg.html',
            scope: {},

            link: function(scope) {
                $log.debug('scope', scope);
                scope.buttonAction = function(button) {
                    $log.debug('button', button);
                };
                scope.buttons = [{
                    name: 'h1',
                    icon: 'fa fa-header',
                    text: '1'
                }, {
                    name: 'h2',
                    icon: 'fa fa-header',
                    text: '2'
                }, {
                    name: 'h3',
                    icon: 'fa fa-header',
                    text: '3'
                }];
            }
        };
    });
