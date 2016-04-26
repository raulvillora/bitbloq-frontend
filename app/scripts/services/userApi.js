'use strict';

/**
 * @ngdoc service
 * @name bitbloqApp.userApi
 * @description
 * # userApi
 * Service in the bitbloqApp.
 */
angular.module('bitbloqApp')
    .service('userApi', function($http, $cookieStore, $localStorage, $q, User, envData, _, utils) {
        // AngularJS will instantiate a singleton by calling "new" on this function
        var exports = {};

        exports.currentUser = {};

        exports.me = function() {
            return User.get();
        };

        exports.getCurrentUser = function(callback) {
            if (arguments.length === 0) {
                return exports.currentUser;
            }
            var value = (exports.currentUser.hasOwnProperty('$promise')) ? exports.currentUser.$promise : exports.currentUser;
            return $q.when(value)
                .then(function(user) {
                    utils.safeCb(callback)(user);
                    return user;
                }, function() {
                    utils.safeCb(callback)({});
                    return {};
                });
        };

        exports.isLoggedIn = function(callback) {
            if (arguments.length === 0) {
                return exports.currentUser.hasOwnProperty('role');
            }

            return exports.getCurrentUser(null).then(function(user) {
                var is = user.hasOwnProperty('role');
                utils.safeCb(callback)(is);
                return is;
            });
        };

        exports.hasRole = function hasRole(role, callback) {
            var userRoles = ['admin', 'user', 'guest'];
            var hasRole = function(r, h) {
                return userRoles.indexOf(r) >= userRoles.indexOf(h);
            };

            if (arguments.length < 2) {
                return hasRole(exports.currentUser.role, role);
            }

            return exports.getCurrentUser(null)
                .then(function(user) {
                    var has = (user.hasOwnProperty('role')) ?
                        hasRole(user.role, role) : false;
                    utils.safeCb(callback)(has);
                    return has;
                });
        };

        exports.registerUser = function(options, callback, errorCallback) {
            return User.save(options, function(data) {
                $cookieStore.put('token', data.token);
                exports.currentUser = User.get();
                return utils.safeCb(callback)(null, data.token);
            }, function(err) {
                return errorCallback(err);
            });
        };

        exports.getToken = function() {
            return $cookieStore.get('token');
        };

        exports.loginBySocialNetwork = function(options) {
            return $http.post(envData.config.gCloudEndpoint + 'user/social', options).then(function(response) {
                var data = response.data;
                return data;
            }, function(err) {
                return err;
            });

        };

        exports.turnSocialToLocal = function(password, callback) {
            return User.turnToLocal({
                id: 'me'
            }, {
                newPassword: password
            }, function() {
                return utils.safeCb(callback)(null);
            }, function(err) {
                return utils.safeCb(callback)(err);
            }).$promise;
        };

        exports.loginUser = function(options, callback) {
            return $http.post(envData.config.gCloudEndpoint + 'auth/local', {
                email: options.email,
                password: options.password
            }).then(function(res) {
                $cookieStore.put('token', res.data.token);
                exports.currentUser = User.get();
                return exports.currentUser.$promise.then(function(user) {
                    utils.safeCb(callback)(null, user);
                    delete user.$promise;
                    delete user.$resolved;
                    return user;
                });
            }).catch(function(err) {
                exports.logout();
                utils.safeCb(callback)(null, err.data);
                return $q.reject(err.data);
            });
        };

        exports.logout = function() {
            $cookieStore.remove('token');
            exports.currentUser = {};
        };

        exports.validateUserName = function(username) {
            return $http.head(envData.config.gCloudEndpoint + 'user/' + username);
        };

        exports.update = function(dataUser) {
            return $http({
                method: 'PUT',
                url: envData.config.gCloudEndpoint + 'user/me',
                data: dataUser
            });
        };

        exports.updateProperties = function(dataUser) {
            return $http({
                method: 'PUT',
                url: envData.config.gCloudEndpoint + 'user/me/properties',
                data: dataUser
            });
        };
        // exports.updateByToken = function (dataUser, token) {
        // return $http({
        //     method: 'PUT',
        //     url: envData.config.iamEndpoint + 'user/me',
        //     data: dataUser,
        //     skipAuthorization: true,
        //     headers: {
        //         authorization: 'Bearer ' + token
        //     }
        // });
        // };

        exports.getSocialProfile = function(provider, token) {
            if (provider === 'google') {
                return $http.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token);
            } else if (provider === 'facebook') {
                return $http.get('https://graph.facebook.com/me?access_token=' + token);
            }
        };

        exports.addSocialNetwork = function(dataProvider) {
            return exports.update(dataProvider);
        };

        exports.resetPassword = function(email) {
            return $http({
                method: 'GET',
                url: envData.config.gCloudEndpoint + 'user/reset',
                params: {
                    email: email
                }
            });
        };

        exports.forgottenPassword = function(email) {
            return $http({
                method: 'POST',
                url: envData.config.gCloudEndpoint + 'user/forgot',
                data: {
                    email: email
                }
            });
        };

        exports.getUserId = function(email) {
            return $http({
                method: 'GET',
                url: envData.config.gCloudEndpoint + 'user/email/' + encodeURIComponent(email)
            });
        };

        // exports.getProfile = function(id) {
        //     var query = {
        //         'api:query': JSON.stringify([{
        //             $eq: {
        //                 id: id
        //             }
        //         }])
        //     };
        //     return _getProfiles(query);
        // };

        // exports.getProfilesByACL = function (options) {
        //     var users = [],
        //         promises = [],
        //         deferedMain = $q.defer();
        //     options.forEach(function (acl) {
        //         var id = acl;
        //         if (id) {
        //             var defered = $q.defer();
        //             promises.push(defered.promise);
        //             _getProfile(id).then(function (response) {
        //                 users.push(response.data);
        //                 defered.resolve(response.data);
        //             }).catch(function () {
        //                 defered.resolve();
        //             });
        //         }
        //     });

        //     $q.all(promises).then(function () {
        //         deferedMain.resolve(users);
        //     });

        //     return deferedMain.promise;
        // };

        exports.getAliasByACL = function(acl) {
            var users = [];
            for (var item in acl) {
                if (acl[item].permission === 'READ' && item !== 'ALL') {
                    users.push(acl[item].properties.email);
                }
            }
            return users;
        };

        exports.getUsersByEmail = function(emails) {
            var userIds = [],
                promises = [],
                deferedMain = $q.defer();

            emails.forEach(function(email) {
                var defered = $q.defer();
                promises.push(defered.promise);
                exports.getUserId(email).then(function(response) {
                    var user = {
                        userId: response.data.id,
                        email: email
                    };
                    userIds.push(user);
                    defered.resolve(user);
                }).catch(function() {
                    defered.resolve();
                });
            });

            $q.all(promises).then(function() {
                deferedMain.resolve(userIds);
            });

            return deferedMain.promise;
        };

        exports.getAllUsers = function() {
            // var queryParams = {
            //     'api:sort': {
            //         '_createdAt': 'desc'
            //     },
            //     'api:page': 0,
            //     'api:pageSize': 50
            // };
            // return _getAllProfiles(queryParams, []);
            return $http.get(envData.config.gCloudEndpoint + 'user/');
        };

        /*
         ****** only admin user
         */
        exports.banUser = function(userId) {
            return $http({
                method: 'HEAD',
                url: envData.config.gCloudEndpoint + 'user/' + userId + '/ban'
            });
        };

        exports.unbanUser = function(userId) {
            return $http({
                method: 'HEAD',
                url: envData.config.gCloudEndpoint + 'user/' + userId + '/unban'
            });
        };

        exports.getBannedUsers = function() {
            return $http({
                method: 'GET',
                url: envData.config.gCloudEndpoint + 'user/banned'
            });
        };

        //
        //exports.disconnectUser = function(userId) {
        //    return $http({
        //        method: 'PUT',
        //        url: envData.config.iamEndpoint + 'user/' + userId + '/disconnect'
        //    });
        //};
        //exports.getBannedUsers = function() {
        //    var params = {
        //        'api:query': [{
        //            '$in': {
        //                'scopes': ['bitbloq:user:banned']
        //            }
        //        }],
        //        'api:sort': {
        //            '_updatedAt': 'asc'
        //        }
        //    };
        //
        //    return resources.getAll(envData.config.iamEndpoint, 'user', params);
        //};
        //
        //exports.setUserBanned = function(user, banned) {
        //    if (banned) {
        //        user.scopes = ['bitbloq:user:banned'];
        //    } else {
        //        user.scopes = ['bitbloq:user'];
        //    }
        //    return _setUser(user);
        //};
        //
        //exports.changePassword = function(newPassword, callback) {
        //    return User.changePassword({
        //        id: 'me'
        //    }, {
        //        newPassword: newPassword
        //    }, function() {
        //        return utils.safeCb(callback)(null);
        //    }, function(err) {
        //        return utils.safeCb(callback)(err);
        //    }).$promise;
        //};
        //
        //function _setUser(user) {
        //    return $http({
        //        method: 'PUT',
        //        url: envData.config.iamEndpoint + 'user/' + user.id,
        //        data: user
        //    });
        //}

        //***********************

        // function _getProfile(userId) {
        //     return $http({
        //         method: 'GET',
        //         url: envData.config.iamEndpoint + 'user/' + userId + '/profile'
        //     });
        // }

        // function _getProfiles(params) {
        //     return $http({
        //         method: 'GET',
        //         url: envData.config.iamEndpoint + 'user/profile',
        //         params: params
        //     });
        // }

        // function _getAllProfiles(queryParams, resultArray, promise) {
        //     var dfd = promise || $q.defer();

        //     _getProfiles(queryParams).then(function (response) {
        //         resultArray = resultArray.concat(response.data);
        //         if (response.data.length === queryParams['api:pageSize']) {
        //             queryParams['api:page']++;
        //             _getAllProfiles(queryParams, resultArray, dfd);
        //         } else {
        //             dfd.resolve(resultArray);
        //         }
        //     }, function (error) {
        //         dfd.reject(error);
        //     });

        //     return dfd.promise;
        // }

        return exports;
    });
