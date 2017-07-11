'use strict';

/**
 * @ngdoc directive
 * @name bitbloqApp.directive:BitbloqTooltip
 * @description
 * # BitbloqTooltip
 */

angular.module('bitbloqApp')
    .directive('bitbloqTooltip', function($log, utils) {
        return {
            restrict: 'A',
            scope: {
                tooltip: '@',
                tooltipPosition: '@',
                tooltips: '@'
            },

            link: function(scope, elem, attr) {
                var widthUsedPerChar = 8;
                //console.log("im a tooltip!", scope, elem, attr);
                if (attr['bitbloqTooltipShowonellipsis']) {
                    elem[0].setAttribute('data-tooltips', false);

                    scope.$watchGroup([
                        function() {
                            return elem[0].offsetWidth;
                        },
                        function() {
                            return elem[0].offsetHeight;
                        }
                    ], function(values) {

                        var numCharacters = elem[0].getAttribute('data-tooltip').length;
                        var needTooltip = elem[0].offsetWidth <= (numCharacters * widthUsedPerChar);
                        if (needTooltip) {
                            elem[0].setAttribute('data-tooltips', true);
                        } else {
                            elem[0].setAttribute('data-tooltips', false);
                        }
                    });
                }

            }
        };
    });