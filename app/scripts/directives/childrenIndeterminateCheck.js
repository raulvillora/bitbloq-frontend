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
                selectedTab: '=',
                json: '='
            },
            link: function(scope, element, attrs, ngModel) {
                console.log(scope.json);
                scope.$watch('indeterminateParentCheckbox', function(newValue) {
                    if (newValue!==undefined && attrs.myTab === scope.selectedTab) {
                        ngModel.$setViewValue(newValue);
                        element.prop('checked', newValue);
                    }
                });

                var initialize = scope.$watch('json', function(newValue, oldValue) {
                    if (oldValue) {
                        initialize();
                    } else if (newValue) {
                        if (newValue.indexOf(attrs.id.split('Check')[0]) > -1) {
                            ngModel.$setViewValue(true);
                            element.prop('checked', true);
                        }
                        initialize();
                    }
                });
            }
        };
    });
