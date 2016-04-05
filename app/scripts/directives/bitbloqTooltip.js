'use strict';

/**
 * @name bitbloqApp.directive:tooltip
 * @description directive that is specific to set tooltips on the app
 * @example <div bitbloq-tooltip text="text" position="top/bottom/left/right" show="true/false"></div>
 */

angular.module('bitbloqApp')
    .directive('bitbloqTooltip', bitbloqTooltip);

function bitbloqTooltip($window, $log) {
    var directive = {
        restrict: 'A',
        scope: {
            tooltipShow: '@',
            text: '@'
        },
        link: link
    };
    return directive;

    function link(scope, element, attrs) {

        function init() {
            var $tooltip = $('[tooltip-text="' + scope.text + '"]');
            setWatchers($tooltip);
            generateTooltip($tooltip);
        }

        init();

        function setWatchers(tooltip) {
            scope.$watch('text', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    generateTooltip();
                    removeTooltip(oldValue);
                }
            });

            element.click(function() {
                tooltip.attr('class', 'tooltip');
            });
        }

        function removeTooltip(tooltip) {
            $('[tooltip-text="' + tooltip + '"]').remove();
        }

        function generateTooltip($tooltip) {
            if (!$tooltip) {
                return false;
            }
            if (scope.tooltipShow === 'true') {
                var _appendTooltip = function() {
                    if (!$tooltip.length) {
                        angular.element('body').append('<div class="tooltip" tooltip-text="' + scope.text + '"></div>');
                    }
                };

                var _setDOMListeners = function() {
                    element.hover(function() {
                        _calculateTooltipPosition(attrs.position);
                        $tooltip.addClass('tooltip-active');
                    }, function() {
                        $tooltip.attr('class', 'tooltip');
                    });
                };

                var _calculateTooltipPosition = function(position) {
                    var x = element.offset().left;
                    var y = element.offset().top;
                    var height = element.height();
                    var width = element.width();

                    position = _checkPosition(position, x, y, height, width);

                    switch (position) {
                        case 'top':
                            if ($tooltip.width() > width) {
                                $tooltip.css('left', x - (($tooltip.width() / 2) - (width / 2) + 9));
                            } else if ($tooltip.width() < width) {
                                $tooltip.css('left', x + (($tooltip.width() / 2) - (width / 2)));
                            }
                            $tooltip.css('top', y - $tooltip.height() - 15);
                            $tooltip.addClass('bottom-arrow');
                            break;
                        case 'bottom':
                            if ($tooltip.width() > width) {
                                $tooltip.css('left', x - (($tooltip.width() / 2) - (width / 2) + 9));
                            } else if ($tooltip.width() < width) {
                                $tooltip.css('left', x + (($tooltip.width() / 2) - (width / 2)));
                            }
                            $tooltip.css('top', y + height + 5);
                            $tooltip.addClass('top-arrow');
                            break;
                        case 'left':
                            if ($tooltip.height() > height) {
                                $tooltip.css('top', y + (($tooltip.height() / 2) - (height / 2)) + parseFloat($tooltip.css('padding-top')));
                            } else if ($tooltip.height() < height) {
                                $tooltip.css('top', y - (($tooltip.height() / 2) - (height / 2)) - parseFloat($tooltip.css('padding-top')));
                                $log.debug($tooltip.css('padding-top'));
                            }
                            $tooltip.css('left', x - $tooltip.width() - 30);
                            $tooltip.addClass('right-arrow');
                            break;
                        case 'right':
                            if ($tooltip.height() > height) {
                                $tooltip.css('top', y + (($tooltip.height() / 2) - (height / 2)) + parseFloat($tooltip.css('padding-top')));
                            } else if ($tooltip.height() < height) {
                                $tooltip.css('top', y - (($tooltip.height() / 2) - (height / 2)) - parseFloat($tooltip.css('padding-top')));
                            }
                            $tooltip.css('left', x + width + 10);
                            $tooltip.addClass('left-arrow');
                            break;
                    }
                };

                var _checkPosition = function(position, x, y, height, width) {
                    switch (position) {
                        case 'top':
                            if (y < ($tooltip.height() + 10)) {
                                position = 'bottom';
                            }
                            break;
                        case 'bottom':
                            if (($window.innerHeight - (y + height)) < ($tooltip.height() + 10)) {
                                position = 'top';
                            }
                            break;
                        case 'left':
                            if (x < ($tooltip.width() + 10)) {
                                position = 'right';
                            }
                            break;
                        case 'right':
                            if (($window.innerWidth - (x + width)) < ($tooltip.width() + 10)) {
                                position = 'left';
                            }
                            break;
                        default:
                            position = 'bottom';
                            break;
                    }
                    return position;
                };
                _appendTooltip();
                _setDOMListeners();
            } else {

            }
        }

        // function checkTooltipVisibility() {
        //     return (scope.tooltipShow === 'false') ? false : true;
        // }

    }
}
