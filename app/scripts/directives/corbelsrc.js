'use strict';

/**
 * @ngdoc directive
 * @name bitbloqApp.directive:corbelSrc
 * @description
 * # corbelSrc
 */
angular.module('bitbloqApp')
    .directive('corbelSrc', function(imageApi, $log, $window, $q, _, $timeout, common) {
        return {
            restrict: 'A',
            scope: {
                corbelSrc: '=',
                corbelImageType: '=',
                corbelCollection: '=',
                corbelWatch: '=',
                corbelForceReset: '='
            },

            link: function postLink(scope, element, attrs) {

                attrs.$set('src', 'images/icons/loadr.svg');
                element.addClass('spin');
                var imageElement = element.parent(),
                    timerRequestImage;

                function getWindowDimensions() {
                    return {
                        'h': imageElement.height(),
                        'w': imageElement.width()
                    };
                }

                function startLoadImage() {
                    if (timerRequestImage) {
                        $timeout.cancel(timerRequestImage);
                    }
                    timerRequestImage = $timeout(loadImage, 1000);
                }

                function loadImage() {
                    attrs.$set('src', 'images/icons/loadr.svg');
                    element.addClass('spin');
                    if (scope.corbelImageType) {
                        var height = getWindowDimensions().h;
                        var width = getWindowDimensions().w;
                        if (width && height) {
                            $log.debug('loadImage', scope.corbelSrc);
                            var params = {
                                'image:operations': 'resizeHeight=' + height + '; cropFromCenter=(' + width + ',' + height + ')'
                            };

                            imageApi.get(scope.corbelSrc, scope.corbelImageType, attrs.corbelCollection, params).success(function(response) {
                                var reader = new FileReader();

                                reader.onloadend = function(e) {
                                    element.removeClass('spin');
                                    attrs.$set('src', e.target.result);
                                };

                                reader.readAsDataURL(response);
                            }).error(function() {
                                $log.debug('image not found');
                                element.removeClass('spin');
                                attrs.$set('src', attrs.corbelDefaultImage);
                            });
                        } else {
                            $log.debug('image not width and height');
                            element.removeClass('spin');
                            attrs.$set('src', attrs.corbelDefaultImage);
                        }

                    } else {
                        if (attrs.corbelCollection === 'Avatar' && attrs.corbelSrc) {
                            if (common.user && scope.corbelSrc === common.user.username) {
                                if (common.user.properties.avatar !== '') {
                                    attrs.$set('src', common.user.properties.avatar);
                                } else {
                                    attrs.$set('src', attrs.corbelDefaultImage);
                                }
                                element.removeClass('spin');

                            } else {
                                //todo if SN -> getIdentity && getSocialNetworkData with diferent user
                                element.removeClass('spin');
                                attrs.$set('src', attrs.corbelDefaultImage);
                            }
                        } else {
                            element.removeClass('spin');
                            attrs.$set('src', attrs.corbelDefaultImage);
                        }
                    }
                }

                scope.$watch('corbelSrc', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        startLoadImage();
                    }
                });

                scope.$watch('corbelForceReset', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        startLoadImage();
                    }
                });

                scope.$watch(getWindowDimensions, function(newValue, oldValue) {
                    if (newValue.h !== 0 && newValue.w !== 0 && (newValue.h !== oldValue.h || newValue.w !== oldValue.w)) {
                        startLoadImage();
                    }
                }, true);

                if (attrs.corbelWatch) {
                    scope.$watch('corbelWatch', function(newValue, oldValue) {
                        if (newValue !== oldValue) {
                            startLoadImage();
                        }
                    });
                }
                if (scope.corbelSrc) {
                    startLoadImage();
                }
            }
        };
    });
