'use strict';

angular.module('bitbloqApp')
    .factory('WSHubsAPIRequests', function ($window, $q, $http) {
        function ConnectionWrapper() {
            this.send = function (message) {
                var messageObj = JSON.parse(message),
                    req = {
                        method: 'POST',
                        url: 'http://localhost:9878', //web2board url
                        headers: {
                            'Content-Type': 'text/plain'
                        },
                        data: message
                    };
                $http(req)
                    .then(function (response) {
                        response.data = JSON.stringify(response.data);
                        api.wsClient.onmessage(response);
                    })
                    .catch(function (response) {
                        messageObj.success = false;
                        messageObj.reply = response.data;
                        api.wsClient.onmessage({data: JSON.stringify(messageObj)});
                    });
            };
        }

        var api = new $window.WSHubsAPI.construct(40000, ConnectionWrapper, $q);
        api.connect();
        api.wsClient.onopen();
        api.wsClient.readyState = WebSocket.OPEN;

        return api;
    });