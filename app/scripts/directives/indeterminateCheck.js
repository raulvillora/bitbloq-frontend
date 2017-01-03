/* global Prism, js_beautify */
/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc directive
 * @name bitbloqApp.directive:indeterminateCheckbox
 */
angular.module('bitbloqApp')
    .directive('indeterminateCheckbox', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                genericCheck: '=',
                functionSelectAll: '=',
                selectedTab: '=',
                updateState: '='
            },
            link: function(scope, element, attrs, ngModel) {
                scope.$watch('genericCheck', function(newValue) {
                    if (newValue) {
                        if (newValue === 'full') {
                            ngModel.$setViewValue(true);
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

                element.bind('change', function() {
                    if (element.prop('checked')) {
                        ngModel.$setViewValue(false);
                        ngModel.$setViewValue(true);
                        scope.functionSelectAll(scope.selectedTab, true, 'all');
                    } else {
                        scope.functionSelectAll(scope.selectedTab, true, 'any');
                    }
                });

                scope.$watch('selectedTab', function(newValue) {
                    if (newValue) {
                        ngModel.$setViewValue(false);
                        if (scope.updateState) {
                            scope.updateState(newValue);
                        }
                    }
                });
            }
        };
    });
