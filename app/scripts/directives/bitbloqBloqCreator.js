'use strict';

/**
 * @ngdoc directive
 * @name bitbloqApp.directive:bitbloqDraggable
 * @description
 * # bitbloqDraggable
 */
angular.module('bitbloqApp')
    .directive('bitbloqBloqCreator', function($log, bloqs) {
        return {
            restrict: 'A',
            name: 'bitbloq-bloq-creator',
            scope: {
                componentsArray: '=',
                bloqSchema: '='
            },
            link: function(scope, element) {

                function generateBloq() {

                    bloq = new bloqs.Bloq({
                        bloqData: scope.bloqSchema,
                        componentsArray: scope.componentsArray
                    });

                    element.append(bloq.$bloq);
                    bloq.$bloq[0].addEventListener('bloq:connectable', bloqItsConnectable);
                    bloqs.startBloqsUpdate(scope.componentsArray);

                }

                function bloqItsConnectable() {
                    bloq.$bloq[0].removeEventListener('bloq:connectable', bloqItsConnectable);
                    generateBloq();
                }

                var bloq,
                    cleanWatcherSchema;

                if (scope.bloqSchema) {
                    generateBloq();
                } else {
                    cleanWatcherSchema = scope.$watch('bloqSchema', function(newValue) {
                        if (newValue) {
                            cleanWatcherSchema();
                            generateBloq();
                        }
                    });
                }

            }
        };
    });