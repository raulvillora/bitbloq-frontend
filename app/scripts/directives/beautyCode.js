/* global Prism*/
/*jshint camelcase: false */
'use strict';

/**
 * @ngdoc directive
 * @name bitbloqApp.directive:beautyCode
 * @description Directive for beautify auto-generated Aruidno code
 * # prism
 */
angular.module('bitbloqApp')
    .directive('beautyCode', function(utils) {
        return {
            name: 'beauty-code',
            template: '<pre class="line-numbers"><code class="language-c"></code></pre>',
            restrict: 'E',
            scope: {
                code: '='
            },
            link: function postLink($scope, $element) {

                var codeTag = $element[0].firstChild.firstChild;

                var beautifier = function(el, code) {
                    var beautyCode = '' + code;

                    beautyCode = utils.prettyCode(code);

                    //Inject beautyCode
                    angular.element(el).text(beautyCode);
                    Prism.highlightElement(el);
                };

                $scope.$watch('code', function(newVal, oldVal) {
                    if (newVal && ((newVal !== oldVal) || (codeTag.children.length === 0))) {
                        beautifier(codeTag, $scope.code);
                    }
                });
            }
        };
    });