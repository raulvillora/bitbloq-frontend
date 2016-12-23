/* global Prism, js_beautify */
/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc directive
 * @name bitbloqApp.directive:beautyCode
 * @description Directive for beautify auto-generated Aruidno code
 * # prism
 */
angular.module('bitbloqApp')
    .directive('indeterminateCheckbox', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                genericCheck: '=',
                functionSelectAll: '=',
                selectedTab: '='
            },
            link: function(scope, element, attrs, ngModel) {
                // Watch the children for changes
                scope.$watch('genericCheck', function(newValue) {
                    console.log(ngModel.$viewValue);
                    if (newValue) {
                        if (newValue === 'full') {
                            element.prop('checked', true);
                            element.prop('indeterminate', false);
                        } else {
                            element.prop('checked', false);
                            element.prop('indeterminate', true);
                        }
                    } else {
                        element.prop('checked', false);
                        element.prop('indeterminate', false);
                    }
                });

                // Bind the onChange event to update children
                element.bind('change', function() {
                    if (element.prop('checked')) {
                        ngModel.$setViewValue(false);
                        ngModel.$setViewValue(true);
                        scope.functionSelectAll(scope.selectedTab, true, 'all');
                    } else {
                        scope.functionSelectAll(scope.selectedTab, true, 'any');
                    }
                });
            }
        };
    });
