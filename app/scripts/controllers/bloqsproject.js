'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:BloqsprojectCtrl
 * @description
 * # BloqsprojectCtrl
 * Controller of the bitbloqApp
 */

angular.module('bitbloqApp')
    .controller('BloqsprojectCtrl', function($rootScope, $route, $scope, $log, $http, $timeout, $routeParams, $document, $window, $q, $translate, $localStorage, $location, imageApi, web2board, alertsService, ngDialog, _, projectApi, bloqs, bloqsUtils, envData, utils, userApi, commonModals, hw2Bloqs) {

        /*************************************************
         Project save / edit
         *************************************************/

        function getDefaultProject() {
            var project = {
                creator: '',
                name: '',
                description: '',
                userTags: [],
                hardwareTags: [],
                videoUrl: '',
                defaultTheme: 'infotab_option_colorTheme',
                software: {
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
                },

                hardware: {
                    board: null,
                    robot: null,
                    components: [],
                    connections: []
                }
            };

            return _.cloneDeep(project);
        }

        function getBoardMetaData() {
            return _.find($scope.hardware.boardList, function(b) {
                return b.name === $scope.project.hardware.board;
            });
        }

        $scope.startAutosave = function() {
            projectApi.startAutosave(saveProject);
            if ($scope.common.user) {
                $scope.hardware.firstLoad = false;
            } else {
                $scope.common.session.project = $scope.getCurrentProject();
            }
        };

        $scope.getHardwareSchema = function() {

            var schema = hw2Bloqs.saveSchema();

            if (schema) { //If project is loaded on protocanvas

                schema.components = schema.components.map(function(elem) {
                    var newElem = _.find($scope.project.hardware.components, {
                        uid: elem.uid
                    });
                    if (newElem) {
                        newElem.connected = elem.connected;
                    }
                    return newElem;
                });

                schema.board = $scope.project.hardware.board;
                schema.robot = $scope.project.hardware.robot;

                return schema;

            } else { //If project is not loading yet on protocanvas
                return _.cloneDeep($scope.project.hardware);
            }

        };

        $scope.setCode = function(code) {
            $scope.code = code;
        };

        function saveProject() {
            var defered = $q.defer();
            var currentProject = $scope.getCurrentProject();
            if ($scope.projectHasChanged(currentProject, $scope.oldProject) || $scope.tempImage.file) {

                currentProject.name = $scope.project.name || $scope.common.translate('new-project');

                $log.debug('Auto saving project...');

                if ($scope.project._id) {
                    if (!$scope.project._acl || ($scope.project._acl['user:' + $scope.common.user._id] && $scope.project._acl['user:' + $scope.common.user._id].permission === 'ADMIN')) {
                        if ($scope.tempImage.file && !$scope.tempImage.generate) {
                            currentProject.image = 'custom';
                        }

                        return projectApi.update($scope.project._id, currentProject).then(function() {
                            $scope.saveOldProject();
                            $localStorage.projfalseectsChange = true;

                            if ($scope.tempImage.file) {
                                imageApi.save($scope.project._id, $scope.tempImage.file).then(function() {
                                    $log.debug('imageSaveok');
                                    $localStorage.projectsChange = true;
                                    $scope.imageForceReset = !$scope.imageForceReset;
                                    $scope.tempImage = {};
                                }, function(error) {
                                    $log.debug('imageSave error', error);
                                });
                            }
                        });
                    } else {
                        projectApi.saveStatus = 4;
                    }
                } else {
                    if ($scope.common.user) {
                        currentProject.creator = $scope.project.creator = $scope.common.user._id;
                        if ($scope.tempImage.file && !$scope.tempImage.generate) {
                            currentProject.image = 'custom';
                        }

                        return projectApi.save(currentProject).then(function(response) {
                            var idProject = response.data;
                            $scope.project._id = idProject;
                            projectApi.get(idProject).success(function(response) {
                                $scope.project._acl = response._acl;
                            });
                            //to avoid reload
                            $route.current.pathParams.id = idProject;
                            $location.url('/bloqsproject/' + idProject);
                            projectApi.saveStatus = 2;
                            $scope.common.isLoading = false;

                            $localStorage.projectsChange = !$localStorage.projectsChange;
                            $scope.saveOldProject();

                            if ($scope.tempImage.file) {
                                imageApi.save($scope.project._id, $scope.tempImage.file).then(function() {
                                    $log.debug('imageSaveok');
                                    $localStorage.projectsChange = true;
                                    $scope.imageForceReset = !$scope.imageForceReset;
                                    $scope.tempImage = {};
                                }, function(error) {
                                    $log.debug('imageSave error', error);
                                });
                            }
                        });
                    } else {
                        projectApi.saveStatus = 0;
                        $log.debug('why we start to save if the user its not logged??, check startAutoSave');
                        defered.reject();
                    }
                }
            } else {
                $log.debug('we cant save Project if there is no changes');
                projectApi.saveStatus = 0;
                defered.resolve();
            }

            return defered.promise;
        }

        $scope.saveProject = saveProject;

        $scope.setProject = function(project) {
            $scope.hardware.firstLoad = true;
            if ($scope.hardware.cleanSchema) {
                $scope.hardware.cleanSchema();
            }
            $scope.project = _.extend(getDefaultProject(), project);
            $scope.refreshComponentsArray();
        };

        $scope.refreshComponentsArray = function() {
            var newComponentsArray = bloqsUtils.getEmptyComponentsArray();
            var newHardwareTags = [];

            var plainComponentListTemporal = [];
            var plainComponentList = [];
            $scope.project.hardware.components.forEach(function(comp) {
                if (!!comp.connected) {
                    if (comp.oscillator === true || comp.oscillator === 'true') {
                        newComponentsArray.oscillators.push(_.cloneDeep(comp));
                    } else {
                        newComponentsArray[comp.category].push(_.cloneDeep(comp));
                    }
                    plainComponentListTemporal.push({
                        'uid': comp.uid,
                        'name': comp.name
                    });
                    newHardwareTags.push(comp.id);
                }
            });

            if ($scope.project.hardware.robot) {
                newComponentsArray.robot.push($scope.project.hardware.robot);
            }

            if ($scope.componentsArray.robot.length > 0) {
                plainComponentList = $scope.componentsArray.robot;
            } else {
                _.forEach($scope.componentsArray, function(n, key) {
                    var compUidList = _.map($scope.componentsArray[key], function(item) {
                        return {
                            'uid': item.uid,
                            'name': item.name
                        };
                    });
                    if (compUidList && compUidList.length > 0) {
                        plainComponentList = plainComponentList.concat(compUidList);
                    }
                });
            }

            if (!_.isEqual($scope.componentsArray, newComponentsArray)) {
                //Regenerate hw tags
                $scope.project.hardwareTags = _.uniq(newHardwareTags);
                if ($scope.project.hardware.robot) {
                    $scope.project.hardwareTags.push($scope.project.hardware.robot);
                } else if ($scope.project.hardware.board) {
                    $scope.project.hardwareTags.push($scope.project.hardware.board);
                }
                //update
                $scope.componentsArray = newComponentsArray;
                bloqs.componentsArray = newComponentsArray;
                $scope.updateBloqs();
                if (!$scope.hardware.firstLoad) {
                    $scope.startAutosave();
                }
            }
        };

        $scope.anyComponent = function(forceCheck) {
            if ($scope.currentTab === 0 && !forceCheck) { //software Toolbox not visible
                return false;
            }
            if (_.isEqual($scope.componentsArray, bloqsUtils.getEmptyComponentsArray())) {
                return false;
            }
            var compCategories = _.pick($scope.componentsArray, function(item) {
                return item.length > 0;
            });
            var tmpCompCategories = _.cloneDeep(compCategories);
            if (tmpCompCategories.robot) {
                delete tmpCompCategories.robot;
            }

            return (Object.keys(tmpCompCategories).length > 0);
        };
        $scope.anyAdvancedComponent = function() {
            return !_.isEqual($scope.componentsArray, bloqsUtils.getEmptyComponentsArray());
        };
        $scope.anySerialComponent = function() {
            return $scope.componentsArray.serialElements.length > 0;
        };

        $scope.getCurrentProject = function() {
            var project = _.cloneDeep($scope.project);
            if ($scope.bloqs.varsBloq) {
                project.software = {
                    vars: $scope.bloqs.varsBloq.getBloqsStructure(),
                    setup: $scope.bloqs.setupBloq.getBloqsStructure(),
                    loop: $scope.bloqs.loopBloq.getBloqsStructure()
                };
            }

            project.hardware = $scope.getHardwareSchema();
            $scope.project.code = bloqsUtils.getCode($scope.componentsArray, $scope.bloqs);
            project.code = $scope.project.code;

            return project;
        };

        $scope.closeMenu = function() {
            $scope.levelOne = $scope.levelTwo = $scope.submenuVisible = false;
        };

        $scope.subMenuHandler = function(menu, action, level) {
            if (action === 'open') {
                $scope.$emit('menu--open');
                switch (level) {
                    case 1:
                        $scope.levelOne = menu;
                        $scope.levelTwo = false;
                        break;
                    case 2:

                        $scope.levelTwo = menu;
                        break;
                    default:
                        throw 'Error opening sidebar menu';
                }
            } else {
                switch (level) {
                    case 1:
                        $scope.levelOne = false;
                        $scope.levelTwo = false;
                        break;
                    case 2:
                        $scope.levelTwo = false;
                        break;
                    default:
                        throw 'Error closing sidebar menu';
                }
            }
        };

        $scope.setLevelTwo = function() {
            $scope.levelTwo = !$scope.levelTwo;
            $scope.submenuSecondVisible = !$scope.submenuSecondVisible;
            $scope.$apply();
        };

        $scope.getSavingStatusIdLabel = projectApi.getSavingStatusIdLabel;

        /************************************************
          ChromeApp Management
        *************************************************/
        var extensionid = envData.config.chromeAppId;
        var port;
        var active = false;

        function connect() {
            if (!active && window.chrome) {
              console.log("entro???");
                try {
                    var connectedPort = chrome.runtime.connect(extensionid);
                    connectedPort.onDisconnect.addListener(function(d) {
                        console.log('port disconnected', d);
                        active = false;
                        port = null;
                    });

                    connectedPort.onMessage.addListener(function(msg) {
                      if(msg.error){
                        alertsService.add('alert-web2board-boardNotReady', 'upload', 'warning');
                      }
                        console.log('avrgirl is done:', msg);
                    });
                    port = connectedPort;

                    active = true;

                } catch (exp) {
                    console.log('cant connect to plugin', exp);
                }
            }
        }

        $scope.sendHex = function() {
            connect();

            var message = {
                board: 'uno',
                file: ':100000000C945D000C9485000C9485000C94850084\n:100010000C9485000C9485000C9485000C9485004C\n:100020000C9485000C9485000C9485000C9485003C\n:100030000C9485000C9485000C9485000C9485002C\n:100040000C94B5000C9485000C9474030C94A603D6\n:100050000C9485000C9485000C9485000C9485000C\n:100060000C9485000C94850000000008000201003B\n:100070000003040700000000000000000102040863\n:100080001020408001020408102001020408102002\n:10009000040404040404040402020202020203032E\n:1000A0000303030300000000250028002B000000CC\n:1000B0000000240027002A00D60311241FBECFEF22\n:1000C000D8E0DEBFCDBF11E0A0E0B1E0E0E5F9E0AF\n:1000D00002C005900D92A832B107D9F721E0A8E23D\n:1000E000B1E001C01D92AE3CB207E1F710E0CAEBEF\n:1000F000D0E004C02297FE010E94A204C83BD107B1\n:10010000C9F70E946E040C94A6040C94000026E02B\n:1001100040E855E260E070E081E391E00E94120364\n:1001200061E0809100010C94C001CF93DF9362E005\n:1001300071E081E391E00E945B04C0E0D1E061E006\n:1001400088810E94F90164EF71E080E090E00E94F4\n:10015000220160E088810E94F90164EF71E080E093\n:1001600090E0DF91CF910C9422011F920F920FB675\n:100170000F9211242F933F938F939F93AF93BF932D\n:100180008091290190912A01A0912B01B0912C011D\n:100190003091280123E0230F2D3720F40196A11D73\n:1001A000B11D05C026E8230F0296A11DB11D2093A5\n:1001B00028018093290190932A01A0932B01B093E9\n:1001C0002C0180912D0190912E01A0912F01B091D1\n:1001D00030010196A11DB11D80932D0190932E0138\n:1001E000A0932F01B0933001BF91AF919F918F9158\n:1001F0003F912F910F900FBE0F901F9018953FB712\n:10020000F89480912D0190912E01A0912F01B09131\n:10021000300126B5A89B05C02F3F19F00196A11DFE\n:10022000B11D3FBF6627782F892F9A2F620F711D4E\n:10023000811D911D42E0660F771F881F991F4A9507\n:10024000D1F708958F929F92AF92BF92CF92DF9293\n:10025000EF92FF926B017C010E94FF004B015C0159\n:10026000C114D104E104F104F1F00E947D040E9464\n:10027000FF00681979098A099B09683E7340810566\n:10028000910570F321E0C21AD108E108F10888EE67\n:10029000880E83E0981EA11CB11CC114D104E10496\n:1002A000F10429F7DDCFFF90EF90DF90CF90BF9062\n:1002B000AF909F908F900895789484B5826084BDAC\n:1002C00084B5816084BD85B5826085BD85B581605A\n:1002D00085BDEEE6F0E0808181608083E1E8F0E0BA\n:1002E0001082808182608083808181608083E0E8E9\n:1002F000F0E0808181608083E1EBF0E080818460C8\n:100300008083E0EBF0E0808181608083EAE7F0E0C9\n:10031000808184608083808182608083808181602D\n:1003200080838081806880831092C100089583302B\n:1003300081F028F4813099F08230A1F0089587305F\n:10034000A9F08830B9F08430D1F4809180008F7D9D\n:1003500003C0809180008F7780938000089584B5DA\n:100360008F7702C084B58F7D84BD08958091B000E1\n:100370008F7703C08091B0008F7D8093B000089587\n:10038000CF93DF9390E0FC01E458FF4F2491FC01F0\n:10039000E057FF4F8491882349F190E0880F991F1F\n:1003A000FC01E255FF4FA591B4918C559F4FFC0184\n:1003B000C591D4919FB7611108C0F8948C91209594\n:1003C00082238C93888182230AC0623051F4F8948E\n:1003D0008C91322F309583238C938881822B888354\n:1003E00004C0F8948C91822B8C939FBFDF91CF91A6\n:1003F00008950F931F93CF93DF931F92CDB7DEB76E\n:10040000282F30E0F901E859FF4F8491F901E458B1\n:10041000FF4F1491F901E057FF4F04910023C9F0F9\n:10042000882321F069830E9497016981E02FF0E021\n:10043000EE0FFF1FEC55FF4FA591B4919FB7F894B5\n:100440008C91611103C01095812301C0812B8C9385\n:100450009FBF0F90DF91CF911F910F910895FC01E5\n:10046000818D228D90E0805C9F4F821B91098F735C\n:1004700099270895FC01918D828D981731F0828D16\n:10048000E80FF11D858D90E008958FEF9FEF08959F\n:10049000FC01918D828D981761F0828DDF01A80F8C\n:1004A000B11D5D968C91928D9F5F9F73928F90E0AE\n:1004B00008958FEF9FEF08958CEC93E0892B49F01E\n:1004C00080E090E0892B29F00E94CC0381110C94EC\n:1004D00000000895FC01848DDF01A80FB11DA35A0F\n:1004E000BF4F2C91848D90E001968F739927848F54\n:1004F000A689B7892C93A089B1898C9180648C934B\n:10050000938D848D981306C00288F389E02D808135\n:100510008F7D80830895CF93DF93EC01888D8823AE\n:10052000C9F0EA89FB89808185FD05C0A889B98960\n:100530008C9186FD0FC00FB607FCF5CF808185FF3B\n:10054000F2CFA889B9898C9185FFEDCFCE010E94A9\n:100550006A02E7CFDF91CF910895CF92DF92FF92A9\n:100560000F931F93CF93DF931F92CDB7DEB76C012C\n:1005700081E0D60158968C9358975B969C915B9737\n:100580005C968C915C97981307C05096ED91FC9106\n:100590005197808185FD2EC0F601038D10E00F5F1D\n:1005A0001F4F0F731127F02EF601848DF81211C022\n:1005B0000FB607FCF9CFD6015096ED91FC915197FB\n:1005C000808185FFF1CFC60169830E946A0269813B\n:1005D000EBCF838DE80FF11DE35AFF4F6083D60107\n:1005E0005B960C935B975296ED91FC9153978081AB\n:1005F00080620CC0D6015696ED91FC9157976083AE\n:100600005096ED91FC91519780818064808381E0C8\n:1006100090E00F90DF91CF911F910F91FF90DF90AD\n:10062000CF900895BF92CF92DF92EF92FF92CF9337\n:10063000DF93EC016A017B01B22EE889F98982E03F\n:100640008083411581EE580761057105A1F060E0D6\n:1006500079E08DE390E0A70196010E947E0421508D\n:100660003109410951095695479537952795211527\n:1006700080E1380798F0E889F989108260E874E829\n:100680008EE190E0A70196010E947E04215031097D\n:10069000410951095695479537952795EC85FD8574\n:1006A0003083EE85FF852083188EEC89FD89B0822A\n:1006B000EA89FB89808180618083EA89FB89808166\n:1006C00088608083EA89FB89808180688083EA89E9\n:1006D000FB8980818F7D8083DF91CF91FF90EF90A8\n:1006E000DF90CF90BF9008951F920F920FB60F9298\n:1006F00011242F938F939F93EF93FF93E0914101E8\n:10070000F09142018081E0914701F091480182FD22\n:1007100012C0908180914A018F5F8F7320914B01AD\n:10072000821751F0E0914A01F0E0EF5CFE4F958FA7\n:1007300080934A0101C08081FF91EF919F918F9139\n:100740002F910F900FBE0F901F9018951F920F9230\n:100750000FB60F9211242F933F934F935F936F9394\n:100760007F938F939F93AF93BF93EF93FF9381E317\n:1007700091E00E946A02FF91EF91BF91AF919F912A\n:100780008F917F916F915F914F913F912F910F903A\n:100790000FBE0F901F90189581E391E00E942F02E9\n:1007A00021E0892B09F420E0822F08951092340172\n:1007B0001092330188EE93E0A0E0B0E08093350121\n:1007C00090933601A0933701B09338018BE091E00C\n:1007D000909332018093310185EC90E090933E013B\n:1007E00080933D0184EC90E09093400180933F0121\n:1007F00080EC90E0909342018093410181EC90E085\n:10080000909344018093430182EC90E090934601E1\n:100810008093450186EC90E09093480180934701D6\n:1008200010924A0110924B0110924C0110924D010E\n:100830000895CF92DF92EF92FF920F931F93CF9381\n:10084000DF937C016A01EB0100E010E00C151D054F\n:1008500071F06991D701ED91FC910190F081E02D4B\n:10086000C7010995892B19F00F5F1F4FEFCFC80102\n:10087000DF91CF911F910F91FF90EF90DF90CF907C\n:1008800008956115710581F0DB010D900020E9F7F5\n:10089000AD0141505109461B570BDC01ED91FC9114\n:1008A0000280F381E02D099480E090E0089567E1F3\n:1008B00071E00C9441040F931F93CF93DF93EC01ED\n:1008C0000E9441048C01CE010E945704800F911FA9\n:1008D000DF91CF911F910F91089508950E945C01BF\n:1008E0000E946D040E948700CCE5D2E00E94950032\n:1008F0002097E1F30E945C02F9CF0895A1E21A2E3D\n:10090000AA1BBB1BFD010DC0AA1FBB1FEE1FFF1FB3\n:10091000A217B307E407F50720F0A21BB30BE40B03\n:10092000F50B661F771F881F991F1A9469F760954A\n:100930007095809590959B01AC01BD01CF01089504\n:10094000EE0FFF1F0590F491E02D0994F894FFCF6E\n:100950000800686F6C610000000000AD0219042FF0\n:100960000248023A028B020D0A006E616E00696E47\n:0809700066006F7666002E00A0\n:00000001FF'
            };

            // post object to extension so that it will flash the file
            port.postMessage(message);
        };

        /*************************************************
         web2board communication
         *************************************************/

        $rootScope.$on('web2board:disconnected', function() {
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:wrong-version', function() {
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:no-web2board', function() {
            alertsService.close(compilingAlert);
            alertsService.close(settingBoardAlert);
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:compile-error', function(event, error) {
            error = JSON.parse(error);
            alertsService.add('alert-web2board-compile-error', 'compile', 'warning', undefined, error.stdErr);
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:compile-verified', function() {
            alertsService.add('alert-web2board-compile-verified', 'compile', 'ok', 5000);
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:boardReady', function(evt, data) {
            data = JSON.parse(data);
            if (data.length > 0) {
                if (!alertsService.isVisible('uid', serialMonitorAlert)) {
                    alertsService.add('alert-web2board-boardReady', 'upload', 'ok', 5000, data[0]);
                }
            } else {
                alertsService.add('alert-web2board-boardNotReady', 'upload', 'warning');
            }
        });

        $rootScope.$on('web2board: boardNotReady', function() {
            alertsService.add('alert-web2board-boardNotReady', 'upload', 'warning');
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:uploading', function(evt, port) {
            alertsService.add('alert-web2board-uploading', 'upload', 'loading', undefined, port);
            web2board.setInProcess(true);
        });

        $rootScope.$on('web2board:code-uploaded', function() {
            alertsService.add('alert-web2board-code-uploaded', 'upload', 'ok', 5000);
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:upload-error', function(evt, data) {
            data = JSON.parse(data);
            if (!data.error) {
                alertsService.add('alert-web2board-upload-error', 'upload', 'warning', undefined, data.stdErr);
            } else if (data.error === 'no port') {
                alertsService.add('alert-web2board-upload-error', 'upload', 'warning');
            } else {
                alertsService.add('alert-web2board-upload-error', 'upload', 'warning', undefined, data.error);
            }
            web2board.setInProcess(false);
        });

        $rootScope.$on('web2board:no-port-found', function() {
            $scope.currentTab = 0;
            $scope.levelOne = 'boards';
            web2board.setInProcess(false);
            alertsService.close(serialMonitorAlert);
            alertsService.add('alert-web2board-no-port-found', 'upload', 'warning');
        });

        $rootScope.$on('web2board:serial-monitor-opened', function() {
            alertsService.close(serialMonitorAlert);
            web2board.setInProcess(false);
        });

        $scope.isWeb2BoardInProgress = web2board.isInProcess;

        function uploadW2b1() {
            $scope.$emit('uploading');
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            if ($scope.project.hardware.board) {
                web2board.setInProcess(true);
                var boardReference = _.find($scope.hardware.boardList, function(b) {
                    return b.name === $scope.project.hardware.board;
                });
                settingBoardAlert = alertsService.add('alert-web2board-settingBoard', 'upload', 'loading');
                web2board.setInProcess(true);

                web2board.upload(boardReference, $scope.getPrettyCode());
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add('alert-web2board-boardNotReady', 'upload', 'warning');
            }
        }

        function uploadW2b2() {
            console.log("boardMetadata");
            console.log(getBoardMetaData());
            console.log("scope");
            console.log($scope.getPrettyCode());
            if ($scope.project.hardware.board) {
                web2board.upload(getBoardMetaData().mcu, $scope.getPrettyCode());
            } else {
                $scope.currentTab = 'info';
                alertsService.add('alert-web2board-boardNotReady', 'upload', 'warning');
            }
        }

        function verifyW2b1() {
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            web2board.setInProcess(true);

            compilingAlert = alertsService.add('alert-web2board-compiling', 'compile', 'loading');
            web2board.setInProcess(true);

            web2board.verify($scope.getPrettyCode());
        }

        function verifyW2b2() {
            console.log("entro al verify!!!!");
            web2board.verify($scope.getPrettyCode());
        }

        function serialMonitorW2b1() {
            if ($scope.isWeb2BoardInProgress()) {
                return false;
            }
            if ($scope.project.hardware.board) {
                web2board.setInProcess(true);
                serialMonitorAlert = alertsService.add('alert-web2board-openSerialMonitor', 'serialmonitor', 'loading');
                var boardReference = _.find($scope.hardware.boardList, function(b) {
                    return b.name === $scope.project.hardware.board;
                });
                web2board.serialMonitor(boardReference);
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add('alert-web2board-no-board-serial', 'serialmonitor', 'warning');

            }
        }

        function serialMonitorW2b2() {
            if ($scope.project.hardware.board) {
                web2board.serialMonitor(getBoardMetaData());
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add('alert-web2board-no-board-serial', 'serialmonitor', 'warning');
            }
        }

        $scope.verify = function() {
            if (web2board.isWeb2boardV2()) {
                verifyW2b2();
            } else {
                verifyW2b1();
            }
        };

        $scope.upload = function() {
            if (web2board.isWeb2boardV2()) {
                uploadW2b2();
            } else {
                uploadW2b1();
            }
        };

        $scope.serialMonitor = function() {
            if (web2board.isWeb2boardV2()) {
                serialMonitorW2b2();
            } else {
                serialMonitorW2b1();
            }
        };

        $scope.chartMonitor = function() {
            if ($scope.project.hardware.board) {
                web2board.chartMonitor(getBoardMetaData());
            } else {
                $scope.currentTab = 0;
                $scope.levelOne = 'boards';
                alertsService.add('alert-web2board-no-board-serial', 'serialmonitor', 'warning');
            }
        };

        $scope.showWeb2boardSettings = function() {
            web2board.showSettings();
        };

        $scope.getCode = function() {
            $scope.updateBloqs();
            return bloqsUtils.getCode($scope.componentsArray, $scope.bloqs);
        };

        $scope.getPrettyCode = function() {
            return utils.prettyCode($scope.getCode());
        };

        /* ****** */

        $scope.informErrorAction = function() {

            var confirmAction = function() {
                    ngDialog.close('ngdialog1');
                },
                parent = $rootScope,
                modalOptions = parent.$new();

            _.extend(modalOptions, {
                title: 'make-actions-share-with-users',
                confirmOnly: true,
                buttonConfirm: 'make-actions-share-with-users-confirm',
                contentTemplate: '/views/modals/shareWithUsers.html',
                confirmAction: confirmAction
            });

            ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--share-with-users',
                scope: modalOptions,
                showClose: false
            });
        };

        $scope.projectHasChanged = function(currentProject, oldProject) {
            var identicalProjectObject = _.isEqual(currentProject, oldProject);
            return !identicalProjectObject || ($scope.tempImage.file);
        };

        $scope.updateBloqs = function() {

            if ($scope.bloqs.varsBloq) {

                var allBloqs = bloqs.bloqs;
                var allComponents = [];

                //Why?
                for (var bloq in allBloqs) {
                    allBloqs[bloq].componentsArray = $scope.componentsArray;
                }

                var updateBloq = function(element, list) {

                    var tempValue,
                        tempRef;

                    tempRef = element.dataset.reference;
                    tempValue = element.dataset.value;

                    bloqsUtils.drawDropdownOptions($(element), list);

                    if (tempRef && tempValue) {

                        var componentRef = list.find(function(comp) {
                            return comp.uid === tempRef;
                        });

                        if (componentRef) {
                            element.value = componentRef.name;
                            element.dataset.reference = componentRef.uid;
                            element.dataset.value = componentRef.name;
                        }

                    } else {
                        $log.debug('dropdown not selected');
                        element.selectedIndex = 0;
                    }

                };
                var bloqCanvasEl = null;
                //Update dropdowns values from bloqs canvas
                for (var type in $scope.componentsArray) {
                    if ($scope.componentsArray[type].length) {
                        bloqCanvasEl = document.getElementsByClassName('bloqs-tab')[0];
                        var nodeList = bloqCanvasEl.querySelectorAll('select[data-dropdowncontent="' + type + '"]');
                        for (var i = 0, len = nodeList.length; i < len; i++) {
                            updateBloq(nodeList[i], $scope.componentsArray[type]);
                        }
                        allComponents = allComponents.concat($scope.componentsArray[type]);
                    }
                }
                //Update dropdowns from bloqs of toolbox
                if (bloqCanvasEl) {
                    var toolboxNodeList = bloqCanvasEl.querySelectorAll('select[data-dropdowncontent="varComponents"]');
                    for (var j = 0, len2 = toolboxNodeList.length; j < len2; j++) {
                        updateBloq(toolboxNodeList[j], allComponents);
                    }

                    var varServos = [];
                    varServos = varServos.concat($scope.componentsArray.servos, $scope.componentsArray.oscillators, $scope.componentsArray.continuousServos);
                    var servosNodeList = bloqCanvasEl.querySelectorAll('select[data-dropdowncontent="allServos"]');
                    for (var y = 0, lenServo = servosNodeList.length; y < lenServo; y++) {
                        updateBloq(servosNodeList[y], varServos);
                    }
                }

            }
        };

        $scope.saveOldProject = function() {
            $scope.oldProject = _.cloneDeep($scope.project);
        };

        $scope.saveOldTempImage = function() {
            $scope.oldTempImage = $scope.tempImage;
        };

        /*************************************************
         Tab settings
         *************************************************/
        $scope.currentTab = 0;

        $scope.setTab = function(index) {
            if (index === 0) {
                hw2Bloqs.repaint();
            } else if (index === 1) {
                if ($scope.toolbox.level !== 1) {
                    $scope.toolbox.level = 1;
                }
                $scope.setCode($scope.getCode());
                $rootScope.$emit('currenttab:bloqstab');
            }

            $scope.currentTab = index;
        };

        $scope.saveBloqStep = function(step) {
            //$log.debug('Guardamos Estado de Bloqs');
            var freeBloqs = bloqs.getFreeBloqs();
            //$log.debug(freeBloqs);
            step = step || {
                vars: $scope.bloqs.varsBloq.getBloqsStructure(),
                setup: $scope.bloqs.setupBloq.getBloqsStructure(),
                loop: $scope.bloqs.loopBloq.getBloqsStructure(),
                freeBloqs: freeBloqs
            };
            saveStep(step, $scope.bloqsHistory);
        };

        $scope.undoBloqStep = function() {
            undo($scope.bloqsHistory, function(step) {
                $scope.project.software = step;
            });
        };

        $scope.redoBloqStep = function() {
            redo($scope.bloqsHistory, function(step) {
                $scope.project.software = step;
            });
        };

        $scope.disableUndo = function() {
            var condition = false;
            switch ($scope.currentTab) {
                case 0:
                    condition = $scope.hardwareHistory.pointer <= 1;
                    break;
                case 1:
                    // condition = true;
                    break;
            }
            return condition;
        };

        $scope.disableRedo = function() {
            var condition = false;
            switch ($scope.currentTab) {
                case 0:
                    condition = !(($scope.hardwareHistory.pointer < ($scope.hardwareHistory.history.length)) && $scope.hardwareHistory.pointer >= 1);
                    break;
                case 1:
                    // condition = true;
                    break;
            }
            return condition;
        };

        $scope.undo = function() {
            switch ($scope.currentTab) {
                case 0:
                    $scope.undoHardwareStep();
                    break;
                case 1:
                    $scope.undoBloqStep();
                    break;
            }
        };

        $scope.redo = function() {
            switch ($scope.currentTab) {
                case 0:
                    $scope.redoHardwareStep();
                    break;
                case 1:
                    $scope.redoBloqStep();
                    break;
            }
        };

        $scope.toggleCollapseHeader = function() {
            $scope.collapsedHeader = !$scope.collapsedHeader;
            hw2Bloqs.repaint();
        };

        $scope.publishProject = function(type) {
            type = type || '';
            var projectEmptyName = $scope.common.translate('new-project');
            if (!$scope.project.name || $scope.project.name === projectEmptyName) {
                if (!$scope.project.description) {
                    alertsService.add('publishProject__alert__nameDescriptionError' + type, 'publishing-project', 'warning');
                } else {
                    alertsService.add('publishProject__alert__nameError' + type, 'publishing-project', 'warning');
                }
                $scope.project.name = $scope.project.name === projectEmptyName ? '' : $scope.project.name;
                $scope.publishProjectError = true;
                $scope.setTab(2);
            } else if (!$scope.project.description) {
                alertsService.add('publishProject__alert__descriptionError' + type, 'publishing-project', 'warning');
                $scope.publishProjectError = true;
                $scope.setTab(2);
            } else {
                var projectDefault = getDefaultProject(),
                    project = $scope.getCurrentProject();
                delete projectDefault.software.freeBloqs;
                if (_.isEqual(projectDefault.software, project.software)) {
                    alertsService.add('publishProject__alert__bloqsProjectEmpty' + type, 'publishing-project', 'warning');
                } else {
                    $scope.publishProjectError = false;
                    if (type === 'Social') {
                        commonModals.shareSocialModal($scope.project);
                    } else {
                        commonModals.publishModal($scope.project);
                    }
                }
            }
        };

        /*************************************************
         UNDO / REDO
         *************************************************/

        //Stores one step in the history
        function saveStep(step, options) {
            options.history = _.take(options.history, options.pointer);
            options.history.push(_.cloneDeep(step));
            options.pointer++;
        }

        function undo(options, callback) {
            if (options.pointer > 1) {
                options.pointer--;
                callback(options.history[options.pointer - 1]);
                $log.debug('actual position', options.pointer);
                $scope.startAutosave();
            }
        }

        function redo(options, callback) {
            if (options.pointer < options.history.length) {
                callback(options.history[options.pointer]);
                options.pointer++;
                $log.debug('actual position', options.pointer);
                $scope.startAutosave();
            }
        }

        function addProjectWatchersAndListener() {
            $scope.$watch('code', function(newVal, oldVal) {
                if (newVal !== oldVal && oldVal !== '') {
                    $scope.startAutosave();
                }
            });

            $scope.$watch('project.hardware.board', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.startAutosave();
                }
            });

            $scope.$watch('project.name', function(newVal, oldVal) {
                if (newVal && newVal !== oldVal) {
                    $scope.startAutosave();
                }
            });

            $scope.$watch('project.videoUrl', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.videoId = utils.isYoutubeURL(newVal);
                    if (!$scope.videoId && newVal) {
                        alertsService.add('validate-videourl', 'save-project', 'warning');
                    } else {
                        $scope.startAutosave();
                    }
                }
            });
            $scope.$watch('project.description', function(newVal, oldVal) {
                if (!newVal) {
                    $scope.project.description = '';
                }
                if (newVal !== oldVal) {
                    $scope.startAutosave();
                }
            });

            $window.addEventListener('bloqs:dragend', function() {
                $scope.saveBloqStep();
                $scope.startAutosave();
                $scope.$apply();
            });

            $window.addEventListener('bloqs:change', function() {
                if ($scope.bloqs.loopBloq) {
                    $scope.saveBloqStep();
                    $scope.startAutosave();
                    $scope.$apply();
                }

            });
        }

        function launchModalTour() {
            ngDialog.closeAll();
            var modalTour = $rootScope.$new(),
                modalTourInit;
            _.extend(modalTour, {
                contentTemplate: '/views/modals/infoTour.html',
                confirmAction: $scope.handleTour,
                rejectAction: $scope.tourDone
            });
            modalTourInit = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--alert',
                scope: modalTour,
                showClose: false,
                closeByDocument: false
            });
        }

        function launchModalAlert() {
            var modalTourStep = $rootScope.$new();
            _.extend(modalTourStep, {
                contentTemplate: '/views/modals/alert.html',
                text: 'modal-tour-step',
                confirmText: 'modal__understood-button',
                confirmAction: showStepFive
            });
            ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--alert',
                scope: modalTourStep,
                showClose: false
            });

        }

        function showStepFive() {
            ngDialog.closeAll();
            $scope.tourCurrentStep = 5;
        }

        function launchModalGuest() {
            var modalGuest = $rootScope.$new(),
                modalGuestInit;
            _.extend(modalGuest, {
                contentTemplate: '/views/modals/alert.html',
                confirmAction: function() {
                    ngDialog.closeAll();
                    $scope.common.goToLogin();
                },
                cancelButton: true,
                text: 'modal-not-registered-text',
                cancelText: 'continue-as-guest',
                confirmText: 'enter-or-register',
                rejectAction: launchModalTour
            });

            modalGuestInit = ngDialog.open({
                template: '/views/modals/modal.html',
                className: 'modal--container modal--alert',
                scope: modalGuest,
                showClose: false,
                closeByDocument: false
            });
        }

        function checkBackspaceKey(event) {
            if (event.which === 8 &&
                event.target.nodeName !== 'INPUT' &&
                event.target.nodeName !== 'SELECT' &&
                event.target.nodeName !== 'TEXTAREA' && !$document[0].activeElement.attributes['data-bloq-id']) {

                event.preventDefault();
            }
        }

        $scope.handleTour = function(step) {

            step = step || 1;
            switch (step) {
                case 1:
                    if (!$scope.tourCurrentStep) {
                        $scope.tourCurrentStep = 1;
                    }
                    break;
                case 2:
                    if ($scope.tourCurrentStep === 1) {

                        $scope.tourCurrentStep = 2;
                        var runStepThree = $scope.$on('menu--open', function() {
                            $timeout(function() {
                                $('.submenu-level').animate({
                                    scrollTop: $('[dragid="led"]').offset().top - 150
                                }, 'slow');
                                $scope.handleTour(3);
                                runStepThree();
                            }, 0);
                        });
                    }
                    break;
                case 3:
                    if ($scope.tourCurrentStep === 2) {
                        $scope.tourCurrentStep = 3;
                        var runStepFour = $rootScope.$on('component-connected', function() {
                            $scope.handleTour(4);
                            runStepFour();
                        });
                    }
                    break;
                case 4:
                    if ($scope.tourCurrentStep === 3) {
                        $scope.tourCurrentStep = 4;
                    }
                    break;
                case 5:
                    if ($scope.tourCurrentStep === 4) {
                        launchModalAlert();
                    }
                    break;
                case 6:
                    if ($scope.tourCurrentStep === 5) {
                        $scope.tourCurrentStep = 6;
                        var runStepSeven = $window.addEventListener('bloqs:connect', function() {
                            $scope.handleTour(7);
                            runStepSeven();
                        });
                    }
                    break;
                case 7:
                    if ($scope.tourCurrentStep === 6) {
                        $scope.$apply(function() {
                            $scope.tourCurrentStep = 7;
                        });
                        var endTour = $scope.$on('uploading', function() {
                            $scope.tourDone();
                            endTour();
                        });
                    }
                    break;
                default:
                    throw 'not a tour step';
            }
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        };

        $scope.tourDone = function() {
            ngDialog.closeAll();
            $scope.tourCurrentStep = null;
            if ($scope.common.user) {
                $scope.common.user.takeTour = true;
                userApi.update({
                    takeTour: true
                });
            }
        };
        $scope.toolbox = {};
        $scope.toolbox.level = 1;

        //'Mad science', objects mantain reference, primitive values can't be passed for generic functions
        $scope.bloqsHistory = {
            pointer: 0,
            history: []
        };
        $scope.hardwareHistory = {
            pointer: 0,
            history: []
        };

        $scope.commonModals = commonModals;
        $scope.utils = utils;

        /*************************************************
         Project settings
         *************************************************/

        var compilingAlert,
            settingBoardAlert,
            serialMonitorAlert;

        $scope.shareWithUserTags = [];

        $scope.code = '';

        $scope.tempImage = {};
        $scope.oldProject = {};
        $scope.oldTempImage = {};
        $scope.project = getDefaultProject();

        $scope.hardware = {
            boardList: null,
            componentList: null,
            robotList: null,
            cleanSchema: null,
            sortToolbox: null,
            firstLoad: true
        };

        $scope.bloqs = {
            varsBloq: null,
            setupBloq: null,
            loopBloq: null
        };

        $scope.componentsArray = bloqsUtils.getEmptyComponentsArray();

        $scope.projectApi = projectApi;

        $scope.imageForceReset = true;

        if (!$scope.common.user) {
            $scope.common.session.save = false;
        }

        /*************************************************
         Load project
         *************************************************/
        $scope.common.isLoading = true;

        $scope.common.itsUserLoaded().then(function() {
            $log.debug('Hay un usuario logeado');
            if ($routeParams.id) {
                loadProject($routeParams.id).finally(function() {
                    addProjectWatchersAndListener();
                });
            } else {
                addProjectWatchersAndListener();
                if ($scope.common.session.save) {
                    $scope.common.session.save = false;
                    $scope.setProject($scope.common.session.project);
                    $scope.startAutosave();
                }
                if (!$scope.common.user.takeTour) {
                    launchModalTour();
                }
            }
        }, function() {
            $log.debug('No hay usuario logeado');
            if ($routeParams.id) {
                loadProject($routeParams.id).then(function() {
                    addProjectWatchersAndListener();
                }, function() {
                    addProjectWatchersAndListener();
                });
            } else {
                addProjectWatchersAndListener();
                launchModalGuest();
            }

        });

        var loadProject = function(id) {
            return projectApi.get(id).then(function(response) {
                if (response.data.codeProject) {
                    $location.path('/codeproject/' + response.data._id);
                } else {
                    //set freebloqs object
                    if (response.data.software) {
                        response.data.software.freeBloqs = response.data.software.freeBloqs || [];
                    }

                    $scope.project = response.data;
                    $scope.saveBloqStep(_.clone(response.data.software));
                    $scope.saveOldProject();
                }
            }, function(error) {
                switch (error.status) {
                    case 404: //not_found
                        alertsService.add('no-project', 'load-project', 'warning');
                        break;
                    case 401: //unauthorized
                        $location.path('/bloqsproject/');
                        alertsService.add('alert_text_errorProjectUnauthorized', 'load-project', 'warning');
                        break;
                    default:
                        alertsService.add('alert_text_errorProjectUndefined', 'load-project', 'warning');
                }
            });
        };

        function confirmExit() {
            var closeMessage;
            if (projectApi.saveStatus === 1) {
                closeMessage = $scope.common.translate('leave-without-save');
            }
            return closeMessage;
        }

        $document.on('keydown', checkBackspaceKey);
        $window.onbeforeunload = confirmExit;

        $scope.$on('$destroy', function() {
            $document.off('keydown', checkBackspaceKey);
            $window.onbeforeunload = null;
        });

    });
