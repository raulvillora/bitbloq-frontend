'use strict';

/**
 * @ngdoc directive
 * @name bitbloqApp.directive:imageChange
 * @description
 * # imageChange
 */
angular.module('bitbloqApp')
    .directive('imageChange', function(common) {
        return {
            restrict: 'A',
            scope: {
                imageChange: '='
            },

            link: function(scope, element, attrs) {
                scope.$watch('imageChange', function(newValue, oldValue) {
                    if (newValue && !oldValue) {
                        var avatarSrc = attrs.ngSrc + '?' + Date.now();
                        attrs.$set('ngSrc', attrs.errSrc);
                        setTimeout(function() {
                            attrs.$set('ngSrc', avatarSrc);
                            common.avatarChange = false;
                        }, 500);
                    }
                });

            }
        };
    });
