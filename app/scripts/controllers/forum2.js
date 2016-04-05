(function() {
    'use strict';
    /**
     * @ngdoc function
     * @name bitbloqApp.controller:forumCtrl
     * @description
     * # forumCtrl
     * Controller of the bitbloqApp
     */
    angular.module('bitbloqApp')
        .controller('ForumCtrl', function(forumApi, $route, alertsService, ngDialog, $routeParams, $location, $scope, $rootScope, $log, utils, imageApi, $q, textAngularManager, _, $timeout, userApi) {
            var forum = this;
            forum.iSaySeed = true;
            forum.displayedView = 'main';
            forum.api = forumApi;
            forum.categoryNames = [];
            forum.categoriesBySection = {};
            forum.bannedUserPerPage = 10;
            forum.categoryThemesPerPage = 10;
            forum.results = {
                show: false,
                data: []
            };
            forum.writtenAnswer = false;
            forum.searchResults = [];
            forum.answersArray = [];
            forum.answer = {
                imageCounter: 0,
                images: []
            };
            forum.isAdmin = false;
            forum.textEditorContent = {
                htmlContent: ''
            };
            forum.searchText = '';

            forum.categoryViewTheme = [];
            forum.themeAnswers = [];
            forum.selectedOption = '';

            // Main section
            forum.sectionsTranslate = {
                'forum_section_1_main': '',
                'forum_section_2_projects': 'Proyectos',
                'forum_section_3_bitbloq': 'Sobre Bitbloq',
                'forum_section_4_language': 'Por idioma / by language / de taa'
            };

            forum.sections = {
                'forum_section_1_main': [],
                'forum_section_2_projects': [],
                'forum_section_3_bitbloq': [],
                'forum_section_4_language': []
            };
            forum.bannedUsers = [];

            init();

            // +++++++++++++++++++++++++++++++++
            // only admin user
            forum.deleteAnswer = function(answer) {
                forumApi.deleteAnswer(answer).then(function() {
                    var index = forum.themeAnswers.indexOf(answer);
                    if (index > -1) {
                        forum.themeAnswers.splice(index, 1);
                    }
                }, function() {
                    alertsService.add('forumAdmin_alert_deletedAnswerError', 'deleteAnswer', 'error');
                });
            };

            forum.deleteTheme = function(themeId) {
                forumApi.deleteTheme(themeId).then(function() {
                    alertsService.add('forumAdmin_alert_deletedTheme', 'deleteTheme', 'warning', 5000);
                    $location.url('/help/forum/' + forum.themeCategory);
                }).catch(function() {
                    alertsService.add('forumAdmin_alert_deletedThemeError', 'deleteTheme', 'error');
                });
            };

            forum.banUser = function(user) {
                if (user.id !== $scope.common.user.id) {
                    userApi.setUserBanned({
                        id: user.id
                    }, true).then(function() {
                        alertsService.add('forumAdmin_alert_bannedUser', 'banUser', 'warning', 5000);
                        user.scopes = ['bitbloq:user:banned'];
                        userApi.disconnectUser(user.id);
                        $scope.$apply();
                    }).catch(function() {
                        alertsService.add('forumAdmin_alert_bannedUserError', 'banUser', 'error');
                    });
                }
            };

            forum.allowUser = function(user) {
                userApi.setUserBanned({
                    id: user.id
                }, false).then(function() {
                    alertsService.add('forumAdmin_alert_allowUser', 'banUser', 'ok', 5000);
                    _.remove(forum.bannedUsers, user);
                }).catch(function() {
                    alertsService.add('forumAdmin_alert_allowUserError', 'banUser', 'error');
                });
            };

            forum.moveTheme = function(themeId) {

                var confirmAction = function() {
                        adminmodal.close();
                        if (modalOptions.dropdown.option) {
                            forumApi.moveTheme(themeId, modalOptions.dropdown.option).then(function() {
                                forum.themeCategory = modalOptions.dropdown.option;
                                $route.current.pathParams.forumsection = modalOptions.dropdown.option;
                                $location.url('/help/forum/' + $route.current.pathParams.forumsection + '/' + $route.current.pathParams.forumresource);
                                alertsService.add($scope.common.translate('forumAdmin_alert_MoveThemeTo') + ' "' + modalOptions.dropdown.option + '"', 'moveTheme', 'ok', 5000);
                            }).catch(function() {
                                alertsService.add('forumAdmin_alert_MoveThemeToError', 'moveTheme', 'error');
                            });
                        }
                    },
                    parent = $rootScope,
                    modalOptions = parent.$new();

                _.extend(modalOptions, {
                    title: 'forumAdmin_buton_moveTheme',
                    confirmButton: 'forumAdmin_buton_moveTheme',
                    rejectButton: 'modal-button-cancel',
                    confirmAction: confirmAction,
                    contentTemplate: '/views/modals/input.html',
                    modalButtons: true,
                    modalDropdown: true,
                    headingOptions: forum.themeCategory,
                    modaloptions: forum.categoryNames,
                    optionsClick: function(category) {
                        modalOptions.dropdown.option = category;
                    },
                    dropdown: {
                        option: '',
                        dataElement: 'categories-dropdown-button'
                    }
                });

                var adminmodal = ngDialog.open({
                    template: '/views/modals/modal.html',
                    className: 'modal--container modal--input',
                    scope: modalOptions,
                    showClose: false
                });
            };
            //++++++++++++++++++++++++++++++++++

            forum.goForumSection = function(section) {
                if (section) {
                    if (section === 'new-theme') {
                        if ($routeParams.forumsection !== 'new-theme') {
                            forum.selectedOption = $routeParams.forumsection;
                        }
                        $scope.common.itsUserLoaded().then(function() {
                            if ($scope.common.user.scopes[0] !== 'bitbloq:user:banned') {
                                _goToSection(section);
                            } else {
                                alertsService.add('forum_alert_accessBannedUser', 'bannedUser', 'error');
                            }
                        }).catch(function() {
                            var url = $location.url();
                            $location.path('login').search({
                                init: url
                            });
                        });

                    } else if (section === 'banned-users') {
                        $scope.common.itsUserLoaded().then(function() {
                            _getBannedUsers();
                            _goToSection(section);
                        }).catch(function() {
                            var url = $location.url();
                            $location.path('login').search({
                                init: url
                            });
                        });
                    } else {
                        _goToSection(section);
                    }
                } else {
                    $location.url('/help/forum/');
                    forum.displayedView = 'main';
                }
            };

            forum.setPublishCategory = function(category) {
                forum.textEditorContent.category = category;
            };

            forum.submitNewTheme = function() {
                if (forum.textEditorContent.category && forum.textEditorContent.title && forum.textEditorContent.htmlContent) {
                    forumApi.getCategoryId(forum.textEditorContent.category).then(function(response) {
                        if (response.data.length > 0) {
                            var theme = {
                                categoryId: response.data[0].id,
                                creator: {
                                    id: $scope.common.user.id,
                                    name: $scope.common.user.username
                                },
                                title: forum.textEditorContent.title
                            };

                            forumApi.postTheme(theme).then(function(themeId) {
                                forum.submitNewAnswer(themeId).then(function() {
                                    forum.goForumSection(forum.textEditorContent.category + '/' + themeId);
                                    alertsService.add('forum_alert_NewTheme', 'createdTheme', 'ok', 5000);
                                }).catch(function() {
                                    alertsService.add('forum_alert_NewThemeError', 'creatingTheme', 'ok', 5000);
                                });
                            }).catch(function(err) {
                                $log.debug('Error creating post:', err);
                                alertsService.add('forum_alert_NewThemeError', 'creatingTheme', 'ok', 5000);
                            });
                        }
                    }).catch(function(err) {
                        $log.debug('Error reading category:', err);

                    });
                } else {
                    $log.debug('fill inputs');
                }
            };

            forum.submitNewAnswer = function(themeId) {
                var defered = $q.defer(),
                    answer = {
                        content: '<p>' + forum.textEditorContent.htmlContent + '</p>',
                        owner: {
                            username: $scope.common.user.username,
                            id: $scope.common.user.id,
                            properties: {
                                imageType: $scope.common.user.properties.imageType
                            }
                        },
                        themeId: themeId || forum.currentTheme.id
                    };

                if (themeId) {
                    answer.main = true;
                }

                forumApi.postAnswer(answer).then(function(response) {
                    forum.textEditorContent.htmlContent = '';
                    var answerId = response;
                    if (forum.answer.images.length > 0) {
                        var images = [],
                            imageId;
                        forum.answer.images.forEach(function(value, index) {
                            imageId = answerId + '-' + index;
                            images.push({
                                id: imageId,
                                type: value.type
                            });
                            imageApi.save(imageId, value, 'ForumAnswers');
                            if (index === forum.answer.images.length - 1) {
                                answer.images = images;
                                forumApi.updateAnswer(answerId, answer).then(function() {
                                    forum.answer.imageCounter = 0;
                                    defered.resolve();
                                }).catch(function() {
                                    defered.resolve();
                                });
                            }
                        });
                    } else {
                        forum.answer.imageCounter = 0;
                        defered.resolve();
                    }
                    forum.themeAnswers.push(answer);
                    forum.answer.images = [];
                    var lastPage = parseInt(forum.themeAnswers.length / forum.categoryThemesPerPage);
                    if ((forum.themeAnswers.length % forum.categoryThemesPerPage) > 0) {
                        lastPage += 1;
                    }
                    if (forum.currentPage !== lastPage) {
                        forum.writtenAnswer = true;
                    }
                    forum.currentPage = lastPage;
                    $log.debug('Post answer', response);
                }).catch(function(err) {
                    $log.debug('Error:', err);
                    alertsService.add('forum_alert_NewAnswerError', 'creatingAnswer', 'ok', 5000);
                    defered.reject();
                });

                return defered.promise;
            };

            forum.getNumber = function(num) {
                return new Array(num);
            };

            forum.pageChangeHandler = function() {
                if (!forum.writtenAnswer) {
                    angular.element('[data-element="help-view"]').scrollTo(0, 0);
                } else {
                    forum.writtenAnswer = false;
                    $timeout(function() {
                        angular.element('[data-element="help-view"]').scrollTo(0, angular.element('.forum__view').height() - 380, 1500);
                    }, 10);
                }
            };

            forum.addImage = function(e) {
                utils.uploadImage(e, {}).then(function(response) {
                    var image = document.createElement('img');
                    image.src = response.img.src;
                    image.className = 'answerImg' + forum.answer.imageCounter + ' BitbloqImg';
                    //image.className= image.className + ('data-type', 'BitbloqImg');
                    var tmp = document.createElement('div');
                    tmp.appendChild(image);
                    if (forum.textEditorContent.htmlContent === '') {
                        forum.textEditorContent.htmlContent = '<p>' + tmp.innerHTML + '<br/></p>';
                    } else {
                        //forum.textEditorContent.htmlContent = forum.textEditorContent.htmlContent.substring(0, forum.textEditorContent.htmlContent.length - 9) + tmp.innerHTML + '</br></p>';
                        forum.textEditorContent.htmlContent += tmp.innerHTML;
                    }
                    forum.answer.imageCounter++;
                    forum.answer.images.push(response.blob);
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }).catch(function(response) {
                    switch (response.error) {
                        case 'heavy':
                            alertsService.add('info-tab-image-heavy-error', 'info-tab-image', 'warning');
                            break;
                        case 'no-image':
                            alertsService.add('info-tab-image-read-error', 'info-tab-image', 'warning');
                            break;
                    }
                });
            };

            forum.setFocusToEditor = function(editorName) {
                var editorScope = textAngularManager.retrieveEditor(editorName).scope;
                editorScope.displayElements.text.trigger('focus');
            };

            function init() {
                setForumRoute();
                addRouteListener();
                getForumCategories();
                setAdmin();

                $scope.$watch(angular.bind(forum, function() {
                    return forum.searchText;
                }), function(newVal) {
                    if (newVal !== '') {
                        if (!forum.results.show) {
                            forum.results.show = true;
                            if (forum.results.data.length === 0) {
                                setSearchData();
                            }
                        }
                    } else {
                        forum.results.show = false;
                    }
                });
            }

            function setCategoryNames(categoryIds) {
                return $q.all(categoryIds.map(function(item) {
                    return forumApi.getCategoryName(item.categoryId).then(function(res) {
                        item.categoryName = res.data[0].name;
                    });
                }));
            }

            function setSearchData() {

                // var getAnswers = forumApi.getAllAnswers(),
                forumApi.getAllThemes().then(function(data) {
                    data.forEach(function(item) {
                        var result = {};
                        result.title = item.title;
                        result.id = item.id;
                        result.owner = item.creator.name;
                        result.categoryId = item.categoryId;
                        forum.results.data.push(result);
                    });

                    setCategoryNames(forum.results.data);
                });
            }

            function setAdmin() {
                $scope.common.itsUserLoaded().then(function() {
                    $scope.common.user.scopes.forEach(function(scope) {
                        if (scope === 'bitbloq:forum:admin') {
                            forum.isAdmin = true;
                        }
                    });
                });
            }

            function getForumCategories() {
                forumApi.getCategories().then(function(response) {
                    forum.categories = response.data;
                    forum.categories.forEach(function(category) {
                        forum.categoryNames.push(category.name);
                    });
                    if (forum.displayedView === 'main') {
                        _getStatsCategories();
                    }
                });
            }

            function goForumCategory(category) {
                forum.displayedView = 'category';
                forum.currentCategory = category;
                forumApi.getCategoryId(category).then(function(response) {
                    var categoryId;
                    if (response.data.length > 0) {
                        categoryId = response.data[0].id;
                    } else {
                        $location.path('/404');
                    }
                    forumApi.getThemesByCategory(categoryId).then(function(response) {
                        forum.categoryThemes = response;
                        forum.categoryPages = forum.categoryThemes.length / 5;
                        forum.categoryThemes.forEach(function(item) {
                            var theme = item;
                            forumApi.countAnswers([theme.id]).then(function(response) {
                                theme.numberOfAnswers = response.data.count || 0;
                            });
                            forumApi.getLastAnswer(theme.id).then(function(response) {
                                theme.lastAnswer = response.data[0];
                            });
                            forumApi.getViewer(theme.id).then(function(response) {
                                theme.numberOfViews = response.timesViewed;
                            });
                        });
                    });
                }).catch(function(err) {
                    $log.debug('Error:', err);
                });
            }

            function goForumTheme(themeId, themeCategory) {
                forumApi.getTheme(themeId).then(function(response) {
                    forum.currentTheme = response.data;
                    forum.themeCategory = themeCategory;
                    forumApi.getAnswers(themeId).then(function(response) {
                        if (response.data.length > 0) {
                            var answers = response.data,
                                container;
                            answers.forEach(function(answer) {
                                if (answer.content.indexOf('<img') > -1) {
                                    container = document.createElement('div');
                                    container.innerHTML = answer.content;
                                    var images = container.querySelectorAll('img.BitbloqImg');
                                    for (var i = 0; i < images.length; i++) {
                                        var img = images[i],
                                            imgId = answer.id + '-' + img.className.split(' ')[0].split('answerImg')[1],
                                            imgType = _.find(answer.images, {
                                                id: imgId
                                            }).type;
                                        _getImages(imgId, imgType, container, answer);
                                    }
                                }
                            });
                            forum.firstAnswer = answers.shift();
                            forum.themeAnswers = answers;
                        } else {
                            $location.path('/404');
                            $log.debug('Error: Answers is empty');
                        }
                    }).catch(function(err) {
                        $log.debug('Error:', err);
                    });
                }).catch(function(err) {
                    $location.path('/404');
                    $log.debug('Error:', err);
                });
            }

            function _getImages(imgId, imgType, container, answer) {
                imageApi.get(imgId, imgType, 'ForumAnswers').then(function(response) {
                    imageApi.createImageUrl(response.data).then(function(newurl) {
                        var answerImage = container.getElementsByClassName('answerImg' + imgId.split('-').pop())[0];
                        if (answerImage) {
                            answerImage.src = newurl;
                        }
                        answer.content = container.innerHTML;
                    });
                });
            }

            function manageRoute(route) {
                var arrayRoute = route.splice(5, route.length - 1);
                if (arrayRoute[0] === 'forum') {
                    var category = arrayRoute[1],
                        theme = arrayRoute[2];
                    if (!theme && category) {
                        if (category === 'new-theme') {
                            $scope.common.itsUserLoaded().then(function() {
                                if ($scope.common.user.scopes[0] !== 'bitbloq:user:banned') {
                                    forum.goForumSection('new-theme');
                                } else {
                                    alertsService.add('forum_alert_accessBannedUser', 'bannedUser', 'error');
                                }
                            }, function() {
                                $location.path('/login');
                            });
                        } else if (category === 'banned-users') {
                            $scope.common.itsUserLoaded().then(function() {
                                forum.goForumSection('banned-users');
                            }, function() {
                                $location.path('/login');
                            });
                        } else {
                            $log.debug('Categoría: ', category);
                            forumApi.getCategoryId(decodeURIComponent(category)).then(function(res) {
                                if (res.data.length === 0) {
                                    $location.path('/404');
                                }
                            });
                        }
                    }

                }
            }

            function addRouteListener() {
                $scope.$on('$locationChangeSuccess', function(next, route) {
                    manageRoute(route.split('/'));
                });
            }

            function setForumRoute() {
                if ($routeParams.forumresource !== '"undefined"' && $routeParams.forumresource) {
                    $location.url('/help/forum/' + $routeParams.forumsection + '/' + $routeParams.forumresource);
                    forum.displayedView = 'theme';
                    goForumTheme($routeParams.forumresource, $routeParams.forumsection);
                } else if ($routeParams.forumsection !== '"undefined"' && $routeParams.forumsection) {
                    var section = $routeParams.forumsection;
                    switch (section) {
                        case 'new-theme':
                            $scope.common.itsUserLoaded().then(function() {
                                forum.displayedView = 'new-theme';
                            }, function() {
                                $location.path('/login');
                            });
                            break;
                        case 'banned-users':
                            $scope.common.itsUserLoaded().then(function() {
                                forum.displayedView = 'banned-users';
                                _getBannedUsers();
                            }, function() {
                                $location.path('/login');
                            });
                            break;
                        default:
                            goForumCategory(section);
                    }
                    $route.current.pathParams.forumsection = section;
                    $location.url('/help/forum/' + section);
                }
            }

            function _getStatsCategories() {
                forum.categories.forEach(function(category) {
                    forumApi.getStatsCategory(category.id).then(function(response) {
                        if (category.section) {
                            forum.sections[category.section].push({
                                name: category.name,
                                description: category.description,
                                order: category.order,
                                numberOfThemes: response.themes,
                                numberOfAnswers: response.answers,
                                lastTheme: response.lastTheme
                            });
                        }
                    });
                });
            }

            function _getBannedUsers() {
                forum.bannedUsers = [];
                userApi.getBannedUsers().then(function(response) {
                    forum.bannedUsers = response;
                });
            }

            function _goToSection(section) {
                $route.current.pathParams.forumsection = section;
                $location.url('/help/forum/' + section);
                forum.displayedView = section;
            }
        });
})();
