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

    function requestToServer(env, method, endPoint, headers, data, callback) {
        var configFile = grunt.file.readJSON('./app/res/config/' + env + '/config.json'),
            options = {
                hostname: configFile.serverHost,
                port: configFile.serverPort,
                path: configFile.serverPath + endPoint,
                method: method
            };
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

    function adminRequestToServer(env, method, endPoint, data, callback) {
        getToken(env, function(err, res) {
            if (err) {
                callback(err);
            } else {
                //console.log(res.token);
                var headers = {
                    'Authorization': 'Bearer ' + res.token
                }
                requestToServer(env, method, endPoint, headers, data, callback);
            }
        });
    };

    function getToken(env, callback) {
        var configFile = grunt.file.readJSON('./app/res/config/' + env + '/config.json'),
            data = {
                email: configFile.adminUser,
                password: configFile.adminPassword
            };
        requestToServer(env, 'POST', 'auth/local', null, data, callback);
    };

    function deleteCollection(collectionName, env, callback) {
        adminRequestToServer(env, 'DELETE', collectionName + '/all', {}, callback);
    };

    function insertCollection(collectionName, items, env, callback) {
        adminRequestToServer(env, 'POST', collectionName + '/all', items, callback);
    };

    function refreshServerCollection(collectionName, items, env, setId, callback) {
        console.log('refresh collection on ' + env);
        deleteCollection(collectionName, env, function(err) {
            if (err) {
                callback(err);
            } else {
                console.log('deleted now start to insert');
                insertCollection(collectionName, items, env, callback);
            }
        });
    };

    grunt.registerTask('updateCollection', function(collectionName, env, setId) {
        grunt.log.writeln('Updating= ' + collectionName + ' on ' + env + ' setting the ID:' + setId);
        var done = this.async(),
            items = grunt.file.readJSON('dataBaseFiles/' + collectionName + '/' + collectionName + '.json');
        refreshServerCollection(collectionName, items, env, setId, function(err, res) {
            if (err) {
                console.log('err updating ', collectionName, 'on', env, ':', err);
                done();
            } else {
                console.log(collectionName, 'on', env, 'update OK');
                done();
            }
        });
    });
};