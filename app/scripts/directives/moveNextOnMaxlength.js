/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc directive
 * @name bitbloqApp.directive:indeterminateCheckbox
 */
angular.module('bitbloqApp')
    .directive('moveNextOnMaxlength', function() {
        return {
            restrict: 'A',
            link: function($scope, element) {
                element.on('input', function() {
                    if (element.val().length === element.attr('maxlength')) {
                        var $nextElement = element.parent().next().children();
                        if ($nextElement.length) {
                            $nextElement[0].focus();
                        }
                    }
                });
            }
        };
    });