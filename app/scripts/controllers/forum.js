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
        .controller('ForumCtrl', function forumCtrl($log, $routeParams, userApi, $location, $route, $scope, common, forumApi, alertsService, utils, _) {
            var forum = this;
            forum.displayedView = 'main';
            forum.bannedUserPerPage = 10;
            forum.categoryThemesPerPage = 10;
            forum.allowUser = userApi.unbanUser;
            forum.banUser = userApi.banUser;
            forum.textEditorContent = {
                htmlContent: ''
            };

            forum.isAdmin = function() {
                if (common.user) {
                    return common.user.role === 'admin';
                } else {
                    return false;
                }
            };

            init();

            forum.goForumSection = function(section) {
                if (section) {
                    switch (section) {
                        case 'new-theme':
                            if ($routeParams.forumsection !== 'new-theme') {
                                forum.selectedOption = $routeParams.forumsection;
                            }
                            common.itsUserLoaded().then(function() {
                                if (!common.user.bannedInForum) {
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
                            break;

                        case 'banned-users':
                            common.itsUserLoaded().then(function() {
                                _getBannedUsers().then(function() {
                                    _goToSection(section);
                                });
                            }).catch(function() {
                                $location.path('login').search({
                                    init: $location.url()
                                });
                            });
                            break;

                        default:
                            _goToSection(section);
                            throw 'Not a section';
                    }
                } else {
                    $location.url('/help/forum/');
                    forum.displayedView = 'main';
                }
            };

            forum.setPublishCategory = function(category) {
                forum.textEditorContent.category = category;
            };

            forum.submitNewAnswer = function(threadId) {
                var answer = {
                    threadId: threadId || forum.currentTheme._id,
                    content: '<p>' + forum.textEditorContent.htmlContent + '</p>',
                    owner: {
                        _id: common.user._id,
                        username: common.user.username
                    }
                };

                if (threadId) {
                    answer.main = true;
                }

                forumApi.createAnswer(answer).then(function() {
                    forum.themeAnswers.push(answer);
                    var lastPage = parseInt(forum.themeAnswers.length / forum.categoryThemesPerPage);
                    if ((forum.themeAnswers.length % forum.categoryThemesPerPage) > 0) {
                        lastPage += 1;
                    }
                    if (forum.currentPage !== lastPage) {
                        forum.writtenAnswer = true;
                    }
                    forum.currentPage = lastPage;
                    $log.debug('POSTING ANSWER: OK');
                }).catch(function(err) {
                    $log.debug('Error:', err);
                    alertsService.add('forum_alert_NewAnswerError', 'creatingAnswer', 'ok', 5000);
                });
            };

            forum.submitNewTheme = function() {
                if (forum.textEditorContent.category && forum.textEditorContent.title && forum.textEditorContent.htmlContent) {
                    var chosenCategory = _.find(forum.categoriesData, function(categoryData) {
                        return categoryData.name === forum.textEditorContent.category;
                    });

                    var thread = {
                        title: forum.textEditorContent.title,
                        categoryId: chosenCategory.uuid,
                        creator: {
                            _id: common.user._id,
                            name: common.user.username
                        }
                    };

                    var answer = {
                        content: '<p>' + forum.textEditorContent.htmlContent + '</p>',
                        owner: {
                            _id: common.user._id,
                            username: common.user.username
                        },
                        main: true
                    };

                    forumApi.createThread(thread, answer).then(function(threadId) {
                        $log.debug('theme: ' + threadId);
                        // forum.goForumSection(forum.textEditorContent.category + '/' + threadId);
                        alertsService.add('forum_alert_NewTheme', 'createdTheme', 'ok', 5000);
                    }).catch(function(err) {
                        $log.debug('Error creating post:', err);
                        alertsService.add('forum_alert_NewThemeError', 'creatingTheme', 'ok', 5000);
                    });
                } else {
                    $log.debug('fill inputs');
                }
            };

            function _getBannedUsers() {
                return userApi.getBannedUsers().then(function(response) {
                    forum.bannedUsers = response.data;
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
                            common.itsUserLoaded().then(function() {
                                forum.displayedView = 'new-theme';
                            }, function() {
                                $location.path('/login');
                            });
                            break;
                        case 'banned-users':
                            common.itsUserLoaded().then(function() {
                                forum.displayedView = 'banned-users';
                                // _getBannedUsers();
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

            function manageRoute(route) {
                var arrayRoute = route.splice(5, route.length - 1);
                if (arrayRoute[0] === 'forum') {
                    var category = arrayRoute[1],
                        theme = arrayRoute[2];
                    if (!theme && category) {
                        if (category === 'new-theme') {
                            common.itsUserLoaded().then(function() {
                                if (!common.user.bannedInForum) {
                                    forum.goForumSection('new-theme');
                                } else {
                                    alertsService.add('forum_alert_accessBannedUser', 'bannedUser', 'error');
                                }
                            }, function() {
                                $location.path('/login');
                            });
                        } else if (category === 'banned-users') {
                            common.itsUserLoaded().then(function() {
                                forum.goForumSection('banned-users');
                            }, function() {
                                $location.path('/login');
                            });
                        } else {
                            $log.debug('Categoría: ', category);
                            var chosenCategory = _.find(forum.categoriesData, function(categoryData) {
                                return categoryData.name === decodeURIComponent(category);
                            });
                            if (!chosenCategory) {
                                $location.path('/404');
                            }
                        }
                    }

                }
            }

            function goForumTheme(themeId, themeCategory) {
                forumApi.getTheme(themeId).then(function(response) {
                    forum.currentTheme = response.data;
                    forum.themeCategory = themeCategory;
                    forumApi.getAnswers(themeId).then(function(response) {
                        // if (response.data.length > 0) {
                        var answers = response.data,
                            container;
                        answers.forEach(function(answer) {
                            if (answer.content.indexOf('<img') > -1) {
                                container = document.createElement('div');
                                container.innerHTML = answer.content;
                                // var images = container.querySelectorAll('img.BitbloqImg');
                                // for (var i = 0; i < images.length; i++) {
                                // var img = images[i],
                                //     imgId = answer.id + '-' + img.className.split(' ')[0].split('answerImg')[1],
                                //     imgType = _.find(answer.images, {
                                //         id: imgId
                                //     }).type;
                                // _getImages(imgId, imgType, container, answer);
                                // }
                            }
                        });
                        forum.firstAnswer = answers.shift();
                        forum.themeAnswers = answers;

                    }).catch(function(err) {
                        $location.path('/404');
                        $log.debug('Error: Answers is empty');
                        $log.debug('Error:', err);
                    });
                }).catch(function(err) {
                    $location.path('/404');
                    $log.debug('Error:', err);
                });
            }

            function goForumCategory(category) {
                forum.displayedView = 'category';
                forum.currentCategory = category;
                forumApi.getThemesInCategory(category, '/name').then(function(response) {
                    forum.categoryThemes = response.data;
                    forum.categoryPages = forum.categoryThemes.length / 5;
                }, function(err) {
                    $log.error('ERROR: ', err);
                });

            }

            function _goToSection(section) {
                $route.current.pathParams.forumsection = section;
                $location.url('/help/forum/' + section);
                forum.displayedView = section;
            }

            function groupCategoriesBySection() {
                return _.chain(forumCategories)
                    .groupBy('section').value();
            }

            function addRouteListener() {
                $scope.$on('$locationChangeSuccess', function(next, route) {
                    manageRoute(route.split('/'));
                });
            }

            function getMainForum() {
                return forumApi.getForumIndex().then(function(response) {
                    forumCategories = response.data;
                    forum.sections = groupCategoriesBySection();
                    setCategoryNames(forumCategories);
                });
            }

            function setCategoryNames(categories) {
                if (categories) {
                    forum.categories = categories.map(function(category) {
                        return category.name;
                    });
                    forum.categoriesData = categories.map(function(category) {
                        return {
                            name: category.name,
                            uuid: category.uuid
                        };
                    });
                }
            }

            function init() {
                if (!forum.categories) {
                    getMainForum().then(function() {
                        setCategoryNames();
                    });
                    setForumRoute();
                    addRouteListener();
                }
            }

            var forumCategories;
        });

})();
