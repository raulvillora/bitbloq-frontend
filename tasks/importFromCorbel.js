module.exports = function(grunt) {
    var cd = null;

    function getCorbelDriver(env) {
        if (!cd) {
            env = env || 'next';
            var configFile = grunt.file.readJSON('./app/res/config/config.json'),
                corbelEnvUrl;
            if (env === 'production') {
                corbelEnvUrl = 'lololololololo';
            } else if (env === 'mvp') {
                corbelEnvUrl = '-current';
            } else {
                corbelEnvUrl = '-' + env;
            }
            grunt.log.oklns('Get Corbel Driver in enviroment = ' + env);

            var corbel = require('../node_modules/corbel-js/dist/corbel.js'),
                async = require('async');

            var options = {
                'clientId': configFile['corbelAdminClientId_' + env],
                'clientSecret': configFile['corbelAdminSecret_' + env],
                //'audience': 'http://iam.bqws.io',
                'urlBase': 'https://{{module}}' + corbelEnvUrl + '.bqws.io/v1.0/'
                    //'scopes': ['bitbloq:web', 'bitbloq:user', 'bitbloq:admin']
            };

            cd = corbel.getDriver(options);
        }
        return cd;
    }

    function getAdminToken(env) {
        var cd = getCorbelDriver(env),
            configFile = grunt.file.readJSON('./app/res/config/config.json');
        grunt.log.oklns('Get Corbel Admin Token');
        return cd.iam.token().create({
            claims: {
                'basic_auth.username': configFile['corbelAdminUsername_' + env],
                'basic_auth.password': configFile['corbelAdminPassword_' + env]
            }
        });
    }

    grunt.task.registerTask('searchBloq', 'search bloq on corbel', function(bloqName, env) {

        var done = this.async();
        env = env || 'next';
        bloqName = bloqName || 'stringArrayAdvanced';
        //bloqName = 'stringArrayAdvanced';
        //numberArrayAdvanced

        getAdminToken(env).then(function(response) {
            grunt.log.writeln('Getting Collection');
            cd.resources.collection('bitbloq:Bloqs')
                .page(0)
                .pageSize(5)
                .get({
                    query: [{
                        '$eq': {
                            'name': bloqName
                        }
                    }]
                }).then(function(response) {
                    grunt.log.writeln(response.data.length);
                    console.log(response.data[0].id);
                    console.log(response.data[0].name);
                    console.log(response.data[0].code);
                    done();
                }).catch(function(error) {
                    console.log('error');
                    console.log(error);
                    done(error);
                });
        }).catch(function(err) {
            grunt.log.error('create token error');
            done(err);
        });
    });

    //grunt updateBloq:next && grunt searchBloq:stringArrayAdvanced:next && grunt searchBloq:numberArrayAdvanced:next && grunt searchBloq:declareVariable:next
    //grunt updateBloq:production && grunt searchBloq:stringArrayAdvanced:production && grunt searchBloq:numberArrayAdvanced:production && grunt searchBloq:declareVariable:production
    grunt.task.registerTask('updateBloq', 'update bloq on corbel', function(env) {
        var done = this.async(),
            bloqId1 = '',
            bloqId2 = '';
        switch (env) {
            case 'next':
                bloqId1 = 'bitbloqadmin:5b796c4b-d693-45ae-a250-5a0d3f14e09f';
                bloqId2 = 'bitbloqadmin:d348c721-36bc-46b8-961f-c27a3b9aba77';
                break;
            case 'production':
                bloqId1 = 'bitbloqadmin:f2aa4570-f072-40d9-a439-225c5aadffc5';
                bloqId2 = 'bitbloqadmin:e52301fd-4eaf-4508-a8b2-5952bea0ed70';
                break;
            default:
        }
        updateBloq(bloqId1, env, function() {
            updateBloq(bloqId2, env, done);
        });
    });

    function updateBloq(id, env, done) {
        //var codeToChange = 'hophop';
        var codeToChange = '({TYPE})malloc({VALUE}*sizeof({TYPE}.withoutAsterisk))';

        getAdminToken(env).then(function(response) {
            grunt.log.writeln('Getting Collection');

            cd.resources.resource('bitbloq:Bloqs', id).
            update({
                code: codeToChange
            }).
            then(function(response) {
                grunt.log.writeln(response.data.length);
                console.log(response.data);
                done();
            }).catch(function(error) {
                console.log('error');
                console.log(error);
                done(error);
            });
        }).catch(function(err) {
            grunt.log.error('create token error');
            done(err);
        });
    }

    var tempCollections = {},
        tempPageNumber = {};

    function getCorbelCollection(collectionName, env, callback) {
        grunt.log.writeln('getCorbelCollection= ' + collectionName + ' on ' + env);
        if (!tempPageNumber[collectionName]) {
            tempCollections[collectionName] = [];
            tempPageNumber[collectionName] = 0;
        }
        getAdminToken(env).then(function(response) {
            grunt.log.writeln('Getting Collection');
            cd.resources.collection('bitbloq:' + collectionName)
                .page(tempPageNumber[collectionName])
                .pageSize(50)
                .get().then(function(response) {
                    grunt.log.writeln(collectionName);
                    grunt.log.writeln(response.data.length);
                    if (response.data.length === 0) {
                        tempPageNumber[collectionName] = undefined;
                        callback(null, tempCollections[collectionName]);
                    } else {
                        tempCollections[collectionName] = tempCollections[collectionName].concat(response.data);
                        tempPageNumber[collectionName] = tempPageNumber[collectionName] + 1;
                        getCorbelCollection(collectionName, env, callback);
                    }

                }).catch(function(error) {
                    console.log('error');
                    console.log(error);
                    callback(error);
                });
        }).catch(function(err) {
            grunt.log.error('create token error');
            callback(err);
        });
    }

    grunt.registerTask('exportCollectionFromCorbel', function(collectionName, env, timestamp) {
        var done = this.async();
        switch (collectionName) {
            case 'project':
                migrateProjectsFromCorbelToBitbloq(env, timestamp, done);
                break;
            default:
                console.log('Unknow Collection, nothing to do  ¯\\_(ツ)_/¯');
                done();
        }

    });

    function migrateProjectsFromCorbelToBitbloq(env, timestamp, callback) {
        var async = require('async'),
            _ = require('lodash');
        async.parallel([
            getCorbelCollection.bind(null, 'Angularproject', env),
            getCorbelCollection.bind(null, 'ProjectStats', env)
        ], function(err, result) {
            if (err) {
                console.log('err');
                callback(err);
            } else {
                console.log('ok');
                console.log(result[0].length);
                console.log(result[1].length);

                var projects = result[0],
                    stats = result[1],
                    tempStat;
                grunt.file.write('./backupsDB/' + timestamp + '/tempprojects.json', JSON.stringify(projects));
                grunt.file.write('./backupsDB/' + timestamp + '/stats.json', JSON.stringify(stats));

                for (var i = 0; i < projects.length; i++) {
                    projects[i]._id = projects[i].id;
                    delete projects[i].id;
                    delete projects[i].creatorUsername;
                    delete projects[i].links;
                    delete projects[i].imageType;
                    tempStat = _.find(stats, ['id', projects[i].id]);
                    if (tempStat) {
                        projects[i].timesViewed = tempStat.timesViewed;
                        projects[i].timesAdded = tempStat.timesAdded;
                    }
                }

                grunt.file.write('./backupsDB/' + timestamp + '/project.json', JSON.stringify(projects));
                callback();
            }
        })
    }

    // grunt importCollectionsFromCorbel:next:qa
    grunt.registerTask('importCollectionsFromCorbel', function(corbelEnv, backEnv) {
        var fs = require('fs'),
            timestamp = Date.now();
        fs.mkdirSync('./backupsDB/' + timestamp);
        grunt.task.run([
            'exportCollectionFromCorbel:project:' + corbelEnv + ':' + timestamp,
            'restoreCollection:project:' + timestamp
            //'exportCollectionFromCorbel:user:' + corbelEnv + ':' + timestamp,
        ]);
    });

};