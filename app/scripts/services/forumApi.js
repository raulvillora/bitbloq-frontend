(function() {
    'use strict';
    angular
        .module('bitbloqApp')
        .factory('forumApi', forumFactory);

    function forumFactory($http, envData) {

        var forumApi = {
            getForumIndex: getForumIndex,
            getTheme: getTheme,
            getAnswers: getAnswers,
            getThemesInCategory: getThemesInCategory,
            addViewer: addViewer,
            createThread: createThread,
            createAnswer: createAnswer
        };

        return forumApi;

        // Get Data
        function getData(resource, options) {
            //if no soy el user owner
            resource = resource || '';
            options = options || {};

            return $http({
                method: 'GET',
                url: envData.config.gCloudEndpoint + 'forum' + resource,
                params: options
            });
        }

        function getForumIndex() {
            return getData();
        }

        function getTheme(themeId) {
            return getData('/threads/' + themeId);
        }

        function getAnswers(themeId) {
            return getData('/answers/' + themeId);
        }

        function getThemesInCategory(categoryName, by) {
            by = by || '';
            return getData('/categories/' + categoryName + by);
        }

        function addViewer(threadId) {
            return $http({
                method: 'HEAD',
                url: envData.config.gCloudEndpoint + 'forum/threadStats/views/' + threadId
            });
        }

        function createThread(thread, answer) {
            return $http({
                method: 'POST',
                url: envData.config.gCloudEndpoint + 'forum/thread',
                data: {
                    thread: thread,
                    answer: answer
                }
            });
        }

        function createAnswer(answer) {
            return $http({
                method: 'POST',
                url: envData.config.gCloudEndpoint + 'forum/answer',
                data: answer
            });
        }
    }
})();