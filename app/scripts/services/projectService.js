'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.projectApi
 * @description
 * # projectApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('projectService', function($log, $window, envData, $q, $rootScope, _, alertsService, imageApi, common, utils, $translate, bowerData, $timeout, hardwareConstants, projectApi, $route, $location, bloqsUtils, hw2Bloqs, commonModals) {

        var exports = {},
            thereAreWatchers = false,
            savePromise,
            oldProject = {};

        exports.bloqs = {
            varsBloq: null,
            setupBloq: null,
            loopBloq: null
        };

        exports.componentsArray = [];

        exports.project = {};

        var scope = $rootScope.$new();
        scope.project = exports.project;

        /**
         * Status of save project
         * 0 = Nothing
         * 1 = AutoSaving in progress
         * 2 = Save correct
         * 3 = Saved Error
         * 4 = Dont Allowed to do Save
         * @type {Number}
         */
        exports.saveStatus = 0;

        exports.savingStatusIdLabels = {
            0: '',
            1: 'make-saving',
            2: 'make-project-saved-ok',
            3: 'make-project-saved-ko',
            4: 'make-project-not-allow-to-save'
        };

        exports.tempImage = {};


        exports.checkPublish = function(type) {
            var defered = $q.defer();
            type = type || '';
            var projectEmptyName = common.translate('new-project');
            if (!exports.project.name || exports.project.name === projectEmptyName) {
                if (!exports.project.description) {
                    alertsService.add({
                        text: 'publishProject__alert__nameDescriptionError' + type,
                        id: 'publishing-project',
                        type: 'warning'
                    });
                } else {
                    alertsService.add({
                        text: 'publishProject__alert__nameError' + type,
                        id: 'publishing-project',
                        type: 'warning'
                    });
                }
                exports.project.name = projectEmptyName ? '' : exports.project.name;
                defered.reject();
            } else if (!exports.project.description) {
                alertsService.add({
                    text: 'publishProject__alert__descriptionError' + type,
                    id: 'publishing-project',
                    type: 'warning'
                });
                defered.reject();
            } else {
                defered.resolve();
            }
            return defered.promise;
        };

        exports.clone = function() {
            exports.completedProject();
            commonModals.clone(exports.project, true);
        };

        exports.completedProject = function() {
            if (!exports.project.codeProject) {
                if (exports.bloqs.varsBloq) {
                    exports.project.software = {
                        vars: exports.bloqs.varsBloq.getBloqsStructure(),
                        setup: exports.bloqs.setupBloq.getBloqsStructure(),
                        loop: exports.bloqs.loopBloq.getBloqsStructure()
                    };
                }

                _updateHardwareSchema();
                exports.project.code = bloqsUtils.getCode(exports.componentsArray, exports.bloqs);
            }
        };

        exports.download = function(project, type, force) {
            project = project || exports.project;
            type = type || 'json';
            if (common.user || force) {
                projectApi.addDownload(project._id).then(function(response) {
                    if (type === 'arduino') {
                        _downloadIno(response.data);
                    } else {
                        _downloadJSON(response.data);
                    }
                });
            } else {
                if (type === 'arduino') {
                    _downloadIno(project);
                } else {
                    _downloadJSON(project);
                }
            }
        };

        exports.isShared = function(project) {
            var found = false,
                i = 0,
                propertyNames = Object.getOwnPropertyNames(project._acl);
            while (!found && (i < propertyNames.length)) {
                if (propertyNames[i] !== 'ALL' && common.user && propertyNames[i].split('user:')[1] !== common.user._id) {
                    found = true;
                }
                i++;
            }
            return found;
        };

        exports.getBoardMetaData = function() {
            return _.find(hardwareConstants.boards, function(board) {
                return board.name === exports.project.hardware.board;
            });
        };

        exports.getCleanProject = function(projectRef) {
            projectRef = projectRef || exports.project;
            var cleanProject = _.cloneDeep(projectRef);
            delete cleanProject._id;
            delete cleanProject._acl;
            delete cleanProject.creator;
            delete cleanProject.createdAt;
            delete cleanProject.updatedAt;
            delete cleanProject.links;
            delete cleanProject.exportedFromBitbloqOffline;
            delete cleanProject.bitbloqOfflineVersion;
            return cleanProject;
        };

        exports.getCode = function() {
            var code;
            if (exports.codeProject) {
                code = exports.project.code;
            } else {
                code = bloqsUtils.getCode(exports.componentsArray, exports.bloqs);
            }
            return code;
        };

        exports.getDefaultProject = function(code) {
            var project = {
                creator: '',
                name: common.translate('new-project'),
                description: '',
                userTags: [],
                hardwareTags: [],
                videoUrl: '',
                defaultTheme: 'infotab_option_colorTheme',
                codeProject: !!code
            };
            if (code === 'code') {
                project.hardware = {
                    board: 'bq ZUM'
                };
                project.code = '/***   Included libraries  ***/\n\n\n/***   Global variables and function definition  ***/\n\n\n/***   Setup  ***/\n\nvoid setup(){\n\n}\n\n/***   Loop  ***/\n\nvoid loop(){\n\n}';
            } else {
                project.software = {
                    vars: {
                        enable: true,
                        name: 'varsBloq',
                        childs: [],
                        content: [
                            []
                        ]
                    },
                    setup: {
                        enable: true,
                        name: 'setupBloq',
                        childs: [],
                        content: [
                            []
                        ]
                    },
                    loop: {
                        enable: true,
                        name: 'loopBloq',
                        childs: [],
                        content: [
                            []
                        ]
                    },
                    freeBloqs: []
                };
                project.hardware = {
                    board: null,
                    robot: null,
                    components: [],
                    connections: []
                };
            }

            return _.cloneDeep(project);
        };

        exports.getSavePromise = function() {
            return savePromise;
        };

        exports.getSavingStatusIdLabel = function() {
            return exports.savingStatusIdLabels[exports.saveStatus];
        };

        exports.projectHasChanged = function() {
            var identicalProjectObject = _.isEqual(exports.project, oldProject);
            return !identicalProjectObject || (exports.tempImage.file);
        };

        exports.saveOldProject = function() {
            oldProject = _.cloneDeep(exports.project);
        };

        exports.setBloqProject = function() {
            exports.project = _.extend(exports.project, exports.getDefaultProject());
            exports.setComponentsArray();
            if (!thereAreWatchers) {
                exports.addWatchers();
            }
        };

        exports.setCodeProject = function(watchers) {
            exports.project = _.extend(exports.project, exports.getDefaultProject('code'));
            if (watchers && !thereAreWatchers) {
                exports.addWatchers();
            }
        };

        exports.setComponentsArray = function(components) {
            if (components) {
                exports.componentsArray = components;
            } else {
                exports.componentsArray = bloqsUtils.getEmptyComponentsArray();
            }
        };

        exports.setProject = function(newproject) {
            exports.project = _.extend(exports.project, newproject);
            if (!thereAreWatchers) {
                exports.addWatchers();
            }
        };

        exports.startAutosave = function() {
            if (common.user) {
                exports.saveStatus = 1;
                if (!savePromise || (savePromise.$$state.status !== 0)) {
                    savePromise = $timeout(_saveProject, envData.config.saveTime || 10000);
                    return savePromise;
                }
            } else {
                exports.completedProject();
                common.session.project = _.cloneDeep(exports.project);
                common.session.save = true;
            }
        };


        //---------------------------------------------------------------------
        //---------------------------------------------------------------------
        //----------------- Private functions ---------------------------------
        //---------------------------------------------------------------------
        //---------------------------------------------------------------------

        function _downloadIno(project, code) {
            code = code || project.code;
            var name = project.name;
            //Remove all diacritics
            name = utils.removeDiacritics(name, undefined, $translate.instant('new-project'));

            utils.downloadFile(name.substring(0, 30) + '.ino', code, 'text/plain;charset=UTF-8');
        }

        function _downloadJSON(projectRef) {
            var project = exports.getCleanProject(projectRef);
            project.bloqsVersion = bowerData.dependencies.bloqs;

            var filename = utils.removeDiacritics(project.name, undefined, $translate.instant('new-project'));

            utils.downloadFile(filename.substring(0, 30) + '.bitbloq', JSON.stringify(project), 'application/json');
        }

        function _init() {
            var def = $q.defer();
            savePromise = def.promise;
            def.resolve();
        }

        function _saveProject() {
            var defered = $q.defer();
            exports.completedProject();
            if (exports.projectHasChanged() || exports.tempImage.file) {

                exports.project.name = exports.project.name || common.translate('new-project');

                $log.debug('Auto saving project...');


                if (exports.tempImage.file && !exports.tempImage.generate) {
                    exports.project.image = 'custom';
                }

                if (exports.project._id) {
                    if (!exports.project._acl || (exports.project._acl['user:' + common.user._id] && exports.project._acl['user:' + common.user._id].permission === 'ADMIN')) {
                        return projectApi.update(exports.project._id, exports.project).then(function() {
                            exports.saveStatus = 2;
                            exports.saveOldProject();
                            localStorage.projectsChange = true;
                            if (exports.tempImage.file) {
                                imageApi.save(exports.project._id, exports.tempImage.file).then(function() {
                                    exports.tempImage = {};
                                });
                            }
                        });
                    } else {
                        exports.saveStatus = 4;
                    }
                } else {
                    if (common.user) {
                        exports.project.creator = common.user._id;
                        return projectApi.save(exports.project).then(function(response) {
                            exports.saveStatus = 2;
                            var idProject = response.data;
                            exports.project._id = idProject;
                            projectApi.get(idProject).success(function(response) {
                                exports.project._acl = response._acl;
                            });
                            //to avoid reload
                            $route.current.pathParams.id = idProject;
                            if (exports.project.codeProject) {
                                $location.url('/codeproject/' + idProject);
                            } else {
                                $location.url('/bloqsproject/' + idProject);
                            }

                            common.isLoading = false;
                            localStorage.projectsChange = !localStorage.projectsChange;
                            exports.saveOldProject();


                            if (exports.tempImage.file) {
                                imageApi.save(idProject, exports.tempImage.file).then(function() {
                                    $log.debug('imageSaveok');
                                    localStorage.projectsChange = true;
                                    exports.tempImage = {};
                                });
                            }
                        }).catch(function() {
                            exports.saveStatus = 3;
                        });
                    } else {
                        exports.saveStatus = 0;
                        $log.debug('why we start to save if the user its not logged??, check startAutoSave');
                        defered.reject();
                    }
                }
            } else {
                $log.debug('we cant save Project if there is no changes');
                exports.saveStatus = 0;
                defered.resolve();
            }


            return defered.promise;
        }

        function _updateHardwareSchema() {

            var schema = hw2Bloqs.saveSchema();
            if (schema) { //If project is loaded on protocanvas
                schema.components = schema.components.map(function(elem) {
                    var newElem = _.find(exports.project.hardware.components, {
                        uid: elem.uid
                    });
                    if (newElem) {
                        newElem.connected = elem.connected;
                    }
                    return newElem;
                });

                schema.board = exports.project.hardware.board;
                schema.robot = exports.project.hardware.robot;
                exports.project.hardware = schema;
            }
        }

        /*************************************************
         init functions and watchers
         *************************************************/
        _init();

        exports.addWatchers = function() {
            thereAreWatchers = true;
            scope.$watch('project.name', function(newVal, oldVal) {
                if (newVal && newVal !== oldVal) {
                    exports.startAutosave(_saveProject);
                }
            });

            scope.$watch('project.description', function(newVal, oldVal) {
                if (!newVal) {
                    exports.project.description = '';
                }
                if (newVal !== oldVal) {
                    exports.startAutosave();
                }
            });

            scope.$watch('project.videoUrl', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    if (!utils.isYoutubeURL(newVal) && newVal) {
                        alertsService.add({
                            text: 'validate-videourl',
                            id: 'save-project',
                            type: 'warning'
                        });
                    } else {
                        exports.startAutosave(_saveProject);
                    }
                }
            });

            scope.$watch('project.code', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    exports.startAutosave(_saveProject);
                }
            });


            scope.$watch('project.hardware.board', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    exports.startAutosave(_saveProject);
                }
            });
        };

        $rootScope.$on('$locationChangeStart', function(event) {
            if (exports.saveStatus === 1) {
                var answer = $window.confirm($translate.instant('leave-without-save') + '\n\n' + $translate.instant('leave-page-question'));
                if (!answer) {
                    event.preventDefault();
                }
            }
        });


        $window.onbeforeunload = function(event) {
            if (exports.saveStatus === 1) {
                var answer = $window.confirm($translate.instant('leave-without-save') + '\n\n' + $translate.instant('leave-page-question'));
                if (!answer) {
                    event.preventDefault();
                }
            }
        };

        return exports;
    });
