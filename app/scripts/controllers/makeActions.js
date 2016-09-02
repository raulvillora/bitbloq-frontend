'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:MakeActionsCtrl
 * @description
 * # MakeActionsCtrl
 * Controller of the bitbloqApp
 */

angular.module('bitbloqApp')
    .controller('MakeActionsCtrl', function($rootScope, $scope, $log, $timeout, $location, $http, $window,
        $document, alertsService, bloqs, ngDialog, projectApi, imageApi, _, $q, $route, $routeParams, utils,
        bloqsUtils, feedbackApi, commonModals, clipboard, rttl, bloqsApi) {

        $scope.uploadProjectSelected = function(fileList) {

            // Only allow uploading one file.
            if (fileList.length > 1) {
                alertsService.add({
                    text: 'make-import-project-format-error',
                    id: 'error-import-project',
                    type: 'warning'
                });
                return false;
            }
            var file = fileList[0];

            var reader = new FileReader();

            reader.onloadend = function(event) {
                var target = event.target,
                    fileParsed;
                // 2 == FileReader.DONE
                if (target.readyState === 2) {

                    try {
                        fileParsed = JSON.parse(target.result);
                    } catch (e) {
                        alertsService.add({
                            text: 'make-import-project-format-error',
                            id: 'error-import-project',
                            type: 'warning'
                        });
                        return false;
                    }
                    if (!fileParsed.defaultTheme) {
                        fileParsed.defaultTheme = 'infotab_option_grayTheme';
                    }
                    if (fileParsed.id) {
                        fileParsed.id = '';
                    }
                    $scope.setProject(fileParsed);
                    $scope.$apply();
                    $scope.setCode($scope.getCode());
                    if (!$scope.common.user) {
                        $scope.common.session.save = true;
                        $scope.common.session.project = fileParsed;
                        //to avoid reload
                        $route.current.pathParams.id = undefined;
                        $location.url('/bloqsproject/');

                    }

                } else {
                    return false;
                }

                // Reset value of input after loading because Chrome will not fire
                // a 'change' event if the same file is loaded again.
                angular.element('#uploadProject')[0].value = '';
            };

            reader.readAsText(file);
        };

        $scope.openProject = function() {

            var dialog, modalScope = $rootScope.$new();
            _.extend(modalScope, {
                title: 'explore-open-project',
                contentTemplate: '/views/modals/openProject.html',
                modalButtons: true,
                selectedTab: 0,
                confirmButton: 'explore-open-project',
                rejectButton: 'cancel',
                selectedProject: {},
                confirmAction: function() {
                    dialog.close();
                    if (modalScope.selectedProject.project.codeProject) {
                        $window.open('#/codeproject/' + modalScope.selectedProject.project._id);
                    } else {
                        $window.open('#/bloqsproject/' + modalScope.selectedProject.project._id);
                    }
                },
                userProjectsOrderBy: 'updatedAt',
                userProjectsReverseOrder: false,
                orderOptions: ['explore-sortby-recent', 'explore-sortby-old', 'explore-sortby-name-az', 'explore-sortby-name-za'],
                userProjectsFilter: 'all',
                sortProjects: sortProjects(modalScope)
            });

            projectApi.getMyProjects().then(function(projects) {
                modalScope.projects = projects;
            }, function() {
                alertsService.add({
                    text: 'make-get-project-error',
                    id: 'make-get-project-error',
                    type: 'warning'
                });
            });

            projectApi.getMySharedProjects().then(function(sharedProjects) {
                modalScope.sharedProjects = sharedProjects;
            }, function() {
                alertsService.add({
                    text: 'make-get-shared-project-error',
                    id: 'make-get-shared-project-error',
                    type: 'warning'
                });
            });

            dialog = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--open-project',
                scope: modalScope,
                showClose: false
            });
        };

        $scope.openFileProject = function() {
            $('#uploadProject').trigger('click');
        };

        $scope.downloadProject = function() {
            var projectRef = $scope.getCurrentProject();
            projectApi.download(projectRef);
        };

        $scope.downloadIno = function() {
            var code = $scope.common.section === 'bloqsproject' ? $scope.getCode() : $scope.project.code;
            $scope.project.code = code;
            projectApi.download($scope.project, 'arduino');
        };

        $scope.loadRTTL = function() {
            var song = 'Indiana:d=4,o=5,b=250:e,8p,8f,8g,8p,1c6,8p.,d,8p,8e,1f,p.,g,8p,8a,8b,8p,1f6,p,a,8p,8b,2c6,2d6,2e6,e,8p,8f,8g,8p,1c6,p,d6,8p,8e6,1f.6,g,8p,8g,e.6,8p,d6,8p,8g,e.6,8p,d6,8p,8g,f.6,8p,e6,8p,8d6,2c6';
            var functionBloq = rttl.rttl2Bitbloq(song);
            console.log(functionBloq);
            //devuelve una funcion

            var newBloq = bloqs.buildBloqWithContent(functionBloq, $scope.componentsArray, bloqsApi.schemas);

            newBloq.doConnectable();
            newBloq.disable();

            newBloq.$bloq[0].style.transform = 'translate(10px, 10px)';

            var field = $('#bloqs--field').last();

            field.append(newBloq.$bloq);

            var i = 0;
            if (newBloq.varInputs) {
                for (i = 0; i < newBloq.varInputs.length; i++) {
                    newBloq.varInputs[i].keyup();
                }
            }

        };

        $scope.removeProject = function(project) {
            if (project._id) {
                $scope.common.removeProjects[project._id] = true;
                $scope.removeAlert[project._id] = alertsService.add({
                    text: 'make-deleted-project',
                    id: 'deleted-project' + project._id,
                    type: 'warning',
                    time: 7000,
                    linkText: 'undo',
                    link: _undoRemoveProject,
                    linkParams: project._id,
                    closeFunction: _deleteProject,
                    closeParams: {
                        _id: project._id,
                        imageType: project.imageType
                    }
                });
                $location.path('projects');
            } else {
                alertsService.add({
                    text: 'make-delete-project-not-changed',
                    id: 'deleted-project',
                    type: 'ok',
                    time: 5000
                });
            }
        };

        $scope.copycode = function() {
            alertsService.add({
                text: 'make-code-clipboard',
                id: 'code-clipboard',
                type: 'info',
                time: 3000
            });
            clipboard.copyText($scope.getCode());
        };

        $scope.clone = function() {
            commonModals.clone($scope.getCurrentProject(), true);
        };

        $scope.zoom = function(value) {
            var max = 2,
                min = 0.7,
                fieldContent = $('.bloq--extension__content'),
                zoom;

            if (value !== 1) {
                zoom = $scope.defaultZoom + value;
            } else {
                zoom = 1;
            }

            if (zoom > max || zoom < min) {
                return false;
            } else {
                fieldContent.css('zoom', zoom);
                $scope.defaultZoom = zoom;
            }
        };

        function _deleteProject(project) {
            if ($scope.common.removeProjects[project._id]) {
                projectApi.delete(project._id).then(function() {
                    $log.log('we delete this project');
                }, function(error) {
                    $log.log('Delete error: ', error);
                    alertsService.add({
                        text: 'make-delete-project-error',
                        id: 'deleted-project',
                        type: 'warning'
                    });
                });
            }
        }

        function sortProjects(modalScope) {
            return function(type) {
                $log.debug('sortProject', type);
                switch (type) {
                    case 'explore-sortby-recent':
                        modalScope.userProjectsOrderBy = 'updatedAt';
                        modalScope.userProjectsReverseOrder = false;
                        break;
                    case 'explore-sortby-old':
                        modalScope.userProjectsOrderBy = 'updatedAt';
                        modalScope.userProjectsReverseOrder = true;
                        break;
                    case 'explore-sortby-name-az':
                        modalScope.userProjectsOrderBy = 'name';
                        modalScope.userProjectsReverseOrder = false;
                        break;
                    case 'explore-sortby-name-za':
                        modalScope.userProjectsOrderBy = 'name';
                        modalScope.userProjectsReverseOrder = true;
                        break;
                }
            };
        }

        function _undoRemoveProject(projectId) {
            alertsService.close($scope.removeAlert[projectId]);
            $scope.common.removeProjects[projectId] = false;
        }

        $scope.dropdownHandler = function(menu) {
            if ($scope.dropdown !== menu) {
                $scope.dropdown = menu;
            } else {
                $scope.dropdown = false;
            }
        };

        $document.on('click', clickDocumentHandler);

        $scope.$on('$destroy', function() {
            $document.off('click', clickDocumentHandler);
        });

        function clickDocumentHandler(evt) {
            if (!$(evt.target).hasClass('actions__menu--selected')) {
                $scope.dropdownHandler(false);
                if (!$scope.$$phase) {
                    $scope.$digest();
                }
            }
        }

        $scope.defaultZoom = 1;
        $scope.modal = {
            projectCloneName: ''
        };
        $scope.projectApi = projectApi;
        $scope.commonModals = commonModals;
        $scope.removeAlert = [];

    });