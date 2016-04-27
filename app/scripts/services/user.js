/* global angular */
'use strict';

function UserResource($resource, envData) {
    return $resource(envData.config.gCloudEndpoint + 'user/:id/:controller/', {
        id: '@_id'
    }, {
        changePassword: {
            method: 'PUT',
            params: {
                controller: 'password'
            }
        },
        changePasswordAuthenticated: {
            method: 'PUT',
            params: {
                id: 'me',
                controller: 'password'
            }
        },
        turnToLocal: {
            method: 'PUT',
            params: {
                id: 'me',
                controller: 'social'
            }
        },
        get: {
            method: 'GET',
            params: {
                id: 'me'
            }
        }
    });
}

angular.module('bitbloqApp')
    .factory('User', UserResource);
