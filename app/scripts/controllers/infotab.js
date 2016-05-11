'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:InfoTabCtrl
 * @description
 * # InfoTabCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('InfoTabCtrl', function($scope, $rootScope, $timeout, envData, imageApi, projectApi, $log, alertsService, _, utils) {

        $scope.setTheme = function(theme) {
            $scope.project.defaultTheme = theme;
            $scope.startAutosave();
        };

        $scope.uploadImageTrigger = function(type) {
            $log.debug('uploadImageTrigger');
            if (type === 'main') {
                $log.debug($('.main-image--input'));
                $('.main-image--input').click();

            } else {
                $('.other-image--input').click();
            }
        };

        $scope.uploadImage = function(e) {
            var properties = {
                minWidth: 600,
                minHeight: 400,
                containerDest: 'projectImage',
                without: /image.gif/
            };
            utils.uploadImage(e, properties).then(function(response) {
                $scope.tempImage.blob = response.blob;
                $scope.tempImage.file = response.file;
                $scope.tempImage.img = response.img;
                $scope.startAutosave();
            }).catch(function(response) {
                switch (response.error) {
                    case 'heavy':
                        alertsService.add('info-tab-image-heavy-error', 'info-tab-image', 'warning');
                        break;
                    case 'small':
                        alertsService.add('info-tab-image-small-error', 'info-tab-image', 'warning');
                        break;
                    case 'no-image':
                        alertsService.add('info-tab-image-read-error', 'info-tab-image', 'warning');
                        break;
                }
            });
        };

        $scope.getTimes = function(n) {
            return new Array(n);
        };

        $scope.addTag = function(tag, event) {
            if (!event || event.keyCode === 13) {
                if (!!tag) {
                    var tagArray = tag.split(',');
                    tagArray.forEach(function(item) {
                        item = item.trim();
                        if (item && $scope.project.userTags.indexOf(item) === -1) {
                            $scope.project.userTags.push(item);
                        }
                    });
                    $scope.startAutosave();
                    $scope.form.tag = '';
                }
            }
        };
        $scope.removeTag = function(tag) {
            var indexTag = $scope.project.userTags.indexOf(tag);
            if (indexTag > -1) {
                $scope.project.userTags.splice(indexTag, 1);
                $scope.startAutosave();
            }
        };

        function composeImage() {
            var canvas = document.getElementById('testcanvas');
            var context = canvas.getContext('2d');
            $log.debug('context', context);
            var imageObj = new Image();
            canvas.width = 285;
            canvas.height = 190;
            if ($scope.project.hardware.board) {
                if ($scope.project.hardware.robot) {
                    var robotRef = _.find($scope.hardware.robotList, function(b) {
                        return b.id === $scope.project.hardware.robot;
                    });
                    var robotIcon = robotRef.id;
                    imageObj.src = '/images/robots/' + robotIcon + '.png';
                } else {
                    var boardRef = _.find($scope.hardware.boardList, function(b) {
                        return b.name === $scope.project.hardware.board;
                    });
                    var boardIcon = boardRef.id;
                    imageObj.src = '/images/boards/' + boardIcon + '.png';
                }
            }
            var components = $scope.project.hardware.components;

            imageObj.onload = function() {
                if ($scope.project.hardware.robot) {
                    setMainImage(canvas, context, imageObj, true);
                } else {
                    setMainImage(canvas, context, imageObj, false);
                }
                setComponentsImage(canvas, context, components);
            };
        }

        function setComponentsImage(canvas, context, components) {

            var limitedComponents = components.slice(0, 4);
            var counter = 0;
            limitedComponents.forEach(function(component) {
                var componentImage = new Image();
                componentImage.src = '/images/components/' + component.id + '.png';
                componentImage.onload = function() {
                    setComponentImage(canvas, context, componentImage, counter);
                    counter++;
                    generateImage(canvas);
                };
            });
        }

        function setComponentImage(canvas, context, imageObj, componentPosition) {
            $log.debug('Set component Image');

            var imageAspectRatio = imageObj.width / imageObj.height;
            var renderableHeight, renderableWidth, xStart, yStart;

            if (componentPosition > 0) {
                xStart = 55 + (componentPosition * 50);
            } else {
                xStart = 55;
            }

            if (imageAspectRatio < 1) {
                renderableHeight = 40;
                renderableWidth = imageObj.width * (renderableHeight / imageObj.height);
                yStart = canvas.height - renderableHeight - 10;
            } else if (imageAspectRatio > 1) {
                renderableWidth = 40;
                renderableHeight = imageObj.height * (renderableWidth / imageObj.width);
                yStart = canvas.height - renderableHeight - 10;
            } else {
                renderableHeight = 40;
                renderableWidth = 40;
                yStart = canvas.height - renderableHeight;
            }
            context.drawImage(imageObj, xStart, yStart, renderableWidth, renderableHeight);

        }

        function setMainImage(canvas, context, imageObj, robot) {

            $log.debug('Set board Image');
            var xStart = (canvas.width - 242) / 2;
            context.fillStyle = '#f3f3f3';
            context.fillRect(0, 0, canvas.width, canvas.height);
            if (robot) {
                context.drawImage(imageObj, xStart, 0, 242, 181);
            } else {
                context.drawImage(imageObj, xStart, -50, 242, 181);
            }
            generateImage(canvas);

        }

        function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new Blob(byteArrays, {
                type: contentType
            });
            return blob;
        }

        function generateImage(canvas) {
            var pngUrl = canvas.toDataURL();
            var base64String = pngUrl.substr(pngUrl.indexOf(',') + 1);
            $log.debug('Generando imagen...');
            $('#projectImage').attr('src', pngUrl);

            $scope.tempImage.blob = b64toBlob(base64String, 'image/png');

            $scope.startAutosave();
        }

        $scope.imagesToUpload = [];
        $scope.projectImages = [0, 1, 2, 3];
        $scope.availableThemes = ['infotab_option_grayTheme', 'infotab_option_colorTheme'];

        $('#textarea').autogrow({
            onInitialize: true
        });

        $rootScope.$on('generate:image', function() {
            $log.debug('composing image');
            composeImage();
        });

    });
