'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.centerModeService
 * @description
 * # centerModeService
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('centerModeService', function($log, $q, $rootScope, _, centerModeApi, ngDialog, alertsService) {

        var exports = {};

        exports.newGroup = function(teacherId, centerId) {
            var def = $q.defer();

            function confirmAction(name) {
                centerModeApi.createGroup(name, teacherId, centerId).then(function(newGroup) {
                    modalOptions.title = name;
                    modalOptions.mainText = 'centerMode_modal_accessIdInfo';
                    modalOptions.confirmButton = null;
                    modalOptions.rejectButton = 'close';
                    modalOptions.modalInput = false;
                    modalOptions.secondaryText = newGroup.data.accessId;
                    modalOptions.modalDropdown = null;
                    def.resolve(newGroup);
                });
            }

            var modalOptions = $rootScope.$new();

            _.extend(modalOptions, {
                title: 'centerMode_modal_createGroupTitle',
                contentTemplate: 'views/modals/input.html',
                mainText: 'centerMode_modal_createGroupInfo',
                modalInput: true,
                secondaryText: false,
                input: {
                    id: 'groupName',
                    name: 'groupName',
                    placeholder: 'centerMode_modal_createGroupPlaceholder'
                },
                condition: function() {
                    return this.input.value && centerId;
                },
                confirmButton: 'centerMode_button_createGroup',
                rejectButton: 'modal-button-cancel',
                confirmAction: confirmAction,
                modalButtons: true
            });

            var centerArray;
            if (!centerId) {
                centerArray = [];
                centerModeApi.getMyCentersAsTeacher().then(function(response) {
                    centerArray = response.data;
                    if (centerArray.length === 1) {
                        centerId = centerArray[0];
                    } else {
                        _.extend(modalOptions, {
                            modalDropdown: true,
                            modaloptions: centerArray,
                            optionsClick: function(selected) {
                                centerId = selected._id;
                            },
                            headingOptions: 'centerMode_createGroup_selectCenter',
                            dropdownDataElement: 'centerMode_dropdown'
                        });
                    }
                    ngDialog.open({
                        template: '/views/modals/modal.html',
                        className: 'modal--container modal--input',
                        scope: modalOptions

                    });

                });
            } else {
                ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions
                });
            }

            return def.promise;
        };

        var thereAreCenterModeWatchers = false,
            nameWatcher,
            addressWatcher,
            telephoneWatcher,
            scope = $rootScope.$new();

        exports.center = {};
        scope.center = exports.center;

        exports.saveCenter = function() {
            var defered = $q.defer();
            alertsService.add({
                text: 'account-saving',
                id: 'saved-user',
                type: 'info',
                time: 5000
            });
            centerModeApi.updateCenter(scope.center).then(function() {
                alertsService.add({
                    text: 'account-saved',
                    id: 'saved-user',
                    type: 'ok',
                    time: 5000
                });
                defered.resolve();
            }, function(error) {
                alertsService.add({
                    text: 'account-saved-error',
                    id: 'saved-user',
                    type: 'warning'
                });
                defered.reject(error);
            });
            return defered.promise;
        };

        exports.setCenter = function(center) {
            if (center) {
                exports.center = center;
            } else {
                exports.center = {};
            }
            scope.center = exports.center;
        };

        exports.addWatchers = function() {
            if (!thereAreCenterModeWatchers) {
                thereAreCenterModeWatchers = true;
                nameWatcher = scope.$watch('center.name', function(newVal, oldVal) {
                    if (oldVal && newVal !== oldVal) {
                        exports.saveCenter();
                    }
                });

                addressWatcher = scope.$watch('center.location', function(newVal, oldVal) {
                    if (oldVal && newVal !== oldVal) {
                        exports.saveCenter();
                    }
                });

                telephoneWatcher = scope.$watch('center.telephone', function(newVal, oldVal) {
                    if (oldVal && newVal !== oldVal) {
                        exports.saveCenter();
                    }
                });
            }
        };

        exports.unBlindAllWatchers = function() {
            if (thereAreCenterModeWatchers) {
                _unBlindGenericWatchers();
            }
        };

        function _unBlindGenericWatchers() {
            thereAreCenterModeWatchers = false;
            if (_thereIsWatcher('center.name')) {
                nameWatcher();
            }
            if (_thereIsWatcher('center.location')) {
                addressWatcher();
            }
            if (_thereIsWatcher('center.telephone')) {
                telephoneWatcher();
            }
        }

        function _thereIsWatcher(variable) {
            var result = _.find(scope.$$watchers, function(item) {
                return item.exp === variable;
            });
            return !!result;
        }

        return exports;
    });
