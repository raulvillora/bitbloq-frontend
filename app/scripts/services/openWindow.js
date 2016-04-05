/* global angular */
'use strict';

angular.module('bitbloqApp')
    .factory('OpenWindow', function() {
        return {
            open: function(windowArguments, onUnload) {
                onUnload = onUnload || angular.noop();
                var args = {
                    url: windowArguments.url,
                    title: windowArguments.title || 'Open window', //todo: use literal
                    options: windowArguments.options || 'width=500, height=700'
                };
                var openedWindow = window.open(args.url, args.title, args.options);
                openedWindow.window.onload = function() {
                    openedWindow.window.onunload = function() {
                        onUnload();
                    };
                };
                return openedWindow;
            }
        };
    });