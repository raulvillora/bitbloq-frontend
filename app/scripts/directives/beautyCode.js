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

                    //Prepare string to js_beautify
                    function insertBeautyIgnores(match) {
                        return '/* beautify ignore:start */' + match + '/* beautify ignore:end */';
                    }

                    beautyCode = utils.prettyCode(code);

                    //Remove beautify ignore & preserve sections
                    beautyCode = beautyCode.replace(/(\/\* (beautify)+ .*? \*\/)/gm, '');

                    //Inject beautyCode
                    angular.element(el).text(beautyCode);
                    Prism.highlightElement(el);
                };

                $scope.$watch('code', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        beautifier(codeTag, $scope.code);
                    }
                });
            }
        };
    });