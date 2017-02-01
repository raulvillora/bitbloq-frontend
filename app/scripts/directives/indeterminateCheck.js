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
                counterCheck: '=',
                changeFunction: '=',
                selectedTab: '=',
                updateState: '=',
                childrenCheckbox: '='
            },
            link: function(scope, element, attrs, ngModel) {

                if (attrs.childrenCheckbox) {
                    scope.$watch('childrenCheckbox.length', function(newValue, oldValue) {
                        if (newValue !== oldValue) {
                            if (newValue && scope.childrenCheckbox.indexOf(attrs.id.split('Check')[0]) > -1) {
                                ngModel.$setViewValue(true);
                                element.prop('checked', true);
                            } else {
                                ngModel.$setViewValue(false);
                                element.prop('checked', false);
                            }
                        }
                    });
                } else {
                    scope.counterCheck = scope.counterCheck || 0;
                    scope.$watch('counterCheck', function(newValue) {
                        if (newValue) {
                            switch (newValue) {
                                case 'full':
                                case 'complete':
                                    ngModel.$setViewValue(true);
                                    element.prop('checked', true);
                                    element.prop('indeterminate', false);
                                    break;
                                default:
                                    element.prop('checked', false);
                                    element.prop('indeterminate', true);
                            }
                        } else {
                            ngModel.$setViewValue(false);
                            element.prop('checked', false);
                            element.prop('indeterminate', false);
                        }
                    });

                    element.bind('change', function() {
                        var counter = 'any';
                        if (element.prop('checked')) {
                            ngModel.$setViewValue(false);
                            ngModel.$setViewValue(true);
                            counter = 'all';
                        }
                        if (attrs.basicTab) {
                            scope.changeFunction(attrs.basicTab, true, counter);
                            if (attrs.advancedTab) {
                                scope.changeFunction(attrs.advancedTab, true, counter);
                            }
                        } else {
                            scope.changeFunction(scope.selectedTab, true, counter);
                        }
                    });

                    scope.$watch('selectedTab', function(newValue, oldValue) {
                        if (attrs.basicTab && (attrs.basicTab === oldValue || attrs.basicTab === newValue)) {
                            //grand parent checkbox
                            var counter = scope.updateState(newValue || oldValue, scope.counterCheck);
                            scope.counterCheck = counter;
                        } else {
                            if (newValue) {
                                if (scope.updateState) {
                                    scope.updateState(newValue);
                                }
                            }
                        }
                    });
                }
            }
        };
    });
