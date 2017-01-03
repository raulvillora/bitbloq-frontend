/* global Prism, js_beautify */
/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc directive
 * @name bitbloqApp.directive:indeterminateParentCheckbox
 */
angular.module('bitbloqApp')
    .directive('indeterminateParentCheckbox', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                indeterminateParentCheckbox: '=',
                selectedTab: '='
            },
            link: function(scope, element, attrs, ngModel) {
                scope.$watch('indeterminateParentCheckbox', function(newValue) {
                    if (newValue && attrs.myTab===scope.selectedTab) {
                        ngModel.$setViewValue(newValue);
                        element.prop('checked', newValue);
                    }
                });
            }
        };
    });
