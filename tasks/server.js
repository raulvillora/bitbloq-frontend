module.exports = function(grunt) {

    function getToken(env, callback) {
        console.log('Get token on ' + env);
        var http = require('http'),
            configFile = grunt.file.readJSON('./app/res/config/' + env + '/config.json'),
            postOptions = {
                hostname: configFile.serverHost,
                port: configFile.serverPort,
                path: configFile.serverPath + 'auth/local',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            },
            postData = {
                email: configFile.adminUser,
                password: configFile.adminPassword
            };

        var postRequest = http.request(postOptions, function(res) {
            res.on('data', function(chunk) {
                // console.log('Received body data:');
                // console.log(JSON.parse(chunk.toString()).token);
                callback(null, JSON.parse(chunk.toString()).token);
            });
        });

        postRequest.on('error', function(err) {
            console.log('problem with request: ${err.message}');
            callback(err);
        });

        postRequest.write(JSON.stringify(postData));
        postRequest.end();
    };

    function refreshServerCollection(token, collectionName, items, env, setId, callback) {
        console.log('refresh collection on ' + env);
        deleteCollection();
        insertCollection();
        callback();
    };

    grunt.registerTask('updateCollection', function(collectionName, env, setId) {
        grunt.log.writeln('Updating= ' + collectionName + ' on ' + env + ' setting the ID:' + setId);
        var done = this.async(),
            items = grunt.file.readJSON('dataBaseFiles/' + collectionName + '/' + collectionName + '.json');
        getToken(env, function(err, token) {
            refreshServerCollection(token, collectionName, items, env, setId, done);
        });
    });
};