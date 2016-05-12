'use strict';

/**
 * @ngdoc directive
 * @name bitbloqApp.directive:dropdown
 * @description
 * # dropdown
 */
angular.module('bitbloqApp')
    .directive('commonDropdown', ['common', function(common) {
        return {
            restrict: 'E',
            templateUrl: '../views/dropdown.html',
            scope: {
                options: '=', // List of items (array)
                translateOptions: '=',
                disabled: '=', // Set the dropdown as disabled
                behavior: '=', // select / dropdown
                headingOption: '=',
                preHeading: '=', // Text before heading
                preHeadingClass: '=',
                heading: '=', // Optional Fixed heading (for behavior === 'dropdown')
                postHeading: '=', // Text after heading
                postHeadingClass: '=',
                optionsClick: '=', // Function to launch with the item name as param
                elementData: '=',
                selectedOption: '=',
                shownOption: '='
            },

            link: function(scope, el, attrs) {
                scope.collapsed = true;
                if (scope.selectedOption) {
                    scope.selected = common.translate(scope.selectedOption);
                    scope.optionsClick(scope.selectedOption);
                }
                scope.dropdownMenuClass = 'dropdown__menu__down';
                if (attrs.direction === 'up') {
                    scope.dropdownMenuClass = 'dropdown__menu__up';
                    var dropdownMenu = el.find('.dropwdown__menu');
                    dropdownMenu.css('bottom', (el.height() - 2) + 'px');
                }

                scope.triggerSelect = function() {
                    scope.collapsed = !scope.collapsed;
                };

                scope.selectOption = function(indexItem) {
                    scope.selected = common.translate(scope.options[indexItem]);
                    scope.collapsed = true;
                    scope.optionsClick(scope.options[indexItem]);
                };

                /*if (attrs.autoCollapse) {
                 element.parent().on('click', function(event) {
                 if (el.find(event.target).length === 0) {
                 scope.collapsed = true;
                 }
                 if (!scope.$$phase) {
                 scope.$digest();
                 }
                 });
                 }*/
            }
        };
    }]);