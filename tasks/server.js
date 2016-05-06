module.exports = function(grunt) {

    var http = require('http');

    function IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    function requestToServer(method, endPoint, headers, data, callback) {
        var configFile = grunt.file.readJSON('./app/res/config/config.json'),
            urlRegExp = /((http[s]?|ftp):\/)?\/?([^:\/\s]+):?(\d+)?((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?/g,
            match = urlRegExp.exec(configFile.serverUrl),
            options = {
                hostname: match[3],
                port: match[4],
                path: match[5] + match[7] + endPoint,
                method: method
            };
        //console.log(options);
        data = JSON.stringify(data);
        options.headers = headers || {};
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(data);
        //console.log(configFile.adminUser, configFile.adminPassword);
        //console.log('options.headers[Content-Length]', options.headers['Content-Length']);

        var postRequest = http.request(options, function(res) {
            res.on('data', function(chunk) {
                // console.log('Received body data:', res.statusCode);
                // console.log(JSON.parse(chunk.toString()).token);
                //console.log('res.statusCode', res.statusCode);
                if ((res.statusCode >= 200) && (res.statusCode < 300)) {
                    var result = chunk.toString();
                    if (IsJsonString(result)) {
                        result = JSON.parse(result);
                    }
                    callback(null, result);
                } else {
                    callback(res.statusCode);
                }
            });
        });

        postRequest.on('error', function(err) {
            console.log('problem with request:', err.message);
            callback(err);
        });

        postRequest.write(data);
        postRequest.end();
    };

    function adminRequestToServer(method, endPoint, data, callback) {
        getToken(function(err, res) {
            if (err) {
                callback(err);
            } else {
                //console.log(res.token);
                var headers = {
                    'Authorization': 'Bearer ' + res.token
                }
                requestToServer(method, endPoint, headers, data, callback);
            }
        });
    };

    function getToken(callback) {
        var configFile = grunt.file.readJSON('./app/res/config/config.json'),
            data = {
                email: configFile.adminUser,
                password: configFile.adminPassword
            };
        requestToServer('POST', 'auth/local', null, data, callback);
    };

    function deleteCollection(collectionName, callback) {
        if (collectionName === 'forumcategory') {
            collectionName = 'forum/category';
        }
        adminRequestToServer('DELETE', collectionName + '/all', {}, callback);
    };

    function insertCollection(collectionName, items, callback) {
        if (collectionName === 'forumcategory') {
            collectionName = 'forum/category';
        }
        adminRequestToServer('POST', collectionName + '/all', items, callback);
    };

    function refreshServerCollection(collectionName, items, callback) {
        console.log('refresh collection');
        deleteCollection(collectionName, function(err) {
            if (err) {
                callback(err);
            } else {
                console.log('deleted now start to insert');
                insertCollection(collectionName, items, callback);
            }
        });
    };

    grunt.registerTask('updateCollection', function(collectionName) {
        grunt.log.writeln('Updating= ' + collectionName);
        var done = this.async(),
            items = grunt.file.readJSON('dataBaseFiles/' + collectionName + '/' + collectionName + '.json');
        refreshServerCollection(collectionName, items, function(err, res) {
            if (err) {
                console.log('err updating ', collectionName, ':', err);
                done();
            } else {
                console.log(collectionName, 'on', 'update OK');
                done();
            }
        });
    });
};