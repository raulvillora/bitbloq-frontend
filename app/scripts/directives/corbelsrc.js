'use strict';

/**
 * @ngdoc directive
 * @name bitbloqApp.directive:imageSrc
 * @description
 * # imageSrc
 */
angular.module('bitbloqApp')
    .directive('imageSrc', function(imageApi, $log, $window, $q, _, $timeout, common) {
        return {
            restrict: 'A',
            scope: {
                imageSrc: '=',
                imageImageType: '=',
                imageCollection: '=',
                imageWatch: '=',
                imageForceReset: '='
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
                    imageApi.get(scope.imageSrc, scope.imageImageType, attrs.imageCollection, params).success(function(response) {
                        var reader = new FileReader();

                        reader.onloadend = function(e) {
                            element.removeClass('spin');
                            attrs.$set('src', e.target.result);
                        };

                        reader.readAsDataURL(response);
                    }).error(function() {
                        $log.debug('image not found');
                        element.removeClass('spin');
                        attrs.$set('src', attrs.imageDefaultImage);
                    });
                    /*if (scope.imageImageType) {
                        var height = getWindowDimensions().h;
                        var width = getWindowDimensions().w;
                        if (width && height) {
                            $log.debug('loadImage', scope.imageSrc);
                            var params = {
                                'image:operations': 'resizeHeight=' + height + '; cropFromCenter=(' + width + ',' + height + ')'
                            };

                            imageApi.get(scope.imageSrc, scope.imageImageType, attrs.imageCollection, params).success(function(response) {
                                var reader = new FileReader();

                                reader.onloadend = function(e) {
                                    element.removeClass('spin');
                                    attrs.$set('src', e.target.result);
                                };

                                reader.readAsDataURL(response);
                            }).error(function() {
                                $log.debug('image not found');
                                element.removeClass('spin');
                                attrs.$set('src', attrs.imageDefaultImage);
                            });
                        } else {
                            $log.debug('image not width and height');
                            element.removeClass('spin');
                            attrs.$set('src', attrs.imageDefaultImage);
                        }

                    } else {
                        if (attrs.imageCollection === 'Avatar' && attrs.imageSrc) {
                            if (common.user && scope.imageSrc === common.user.username) {
                                if (common.user.properties.avatar !== '') {
                                    attrs.$set('src', common.user.properties.avatar);
                                } else {
                                    attrs.$set('src', attrs.imageDefaultImage);
                                }
                                element.removeClass('spin');

                            } else {
                                //todo if SN -> getIdentity && getSocialNetworkData with diferent user
                                element.removeClass('spin');
                                attrs.$set('src', attrs.imageDefaultImage);
                            }
                        } else {
                            element.removeClass('spin');
                            attrs.$set('src', attrs.imageDefaultImage);
                        }
                    }*/
                }

                scope.$watch('imageSrc', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        startLoadImage();
                    }
                });

                scope.$watch('imageForceReset', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        startLoadImage();
                    }
                });

                scope.$watch(getWindowDimensions, function(newValue, oldValue) {
                    if (newValue.h !== 0 && newValue.w !== 0 && (newValue.h !== oldValue.h || newValue.w !== oldValue.w)) {
                        startLoadImage();
                    }
                }, true);

                if (attrs.imageWatch) {
                    scope.$watch('imageWatch', function(newValue, oldValue) {
                        if (newValue !== oldValue) {
                            startLoadImage();
                        }
                    });
                }
                if (scope.imageSrc) {
                    startLoadImage();
                }
            }
        };
    });
