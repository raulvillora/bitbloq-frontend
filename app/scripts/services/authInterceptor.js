'use strict';
angular.module('bitbloqApp')
    .service('authInterceptor', function($cookieStore, $routeParams) {
        return {
            // Add authorization token to headers
            request: function(config) {
                config.headers = config.headers || {};
                if ($cookieStore.get('token') || $routeParams.token) {
                    config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
                }
                return config;
            }
        };
    });