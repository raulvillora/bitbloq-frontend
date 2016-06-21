'use strict';
module.exports = function(grunt) {
    var cd = null;

    function getCorbelDriver(env) {
        if (!cd) {
            env = env || 'next';
            var configFile = grunt.file.readJSON('gruntconfig.json'),
                corbelEnvUrl;
            if (env === 'production') {
                corbelEnvUrl = '';
            } else if (env === 'mvp') {
                corbelEnvUrl = '-current';
            } else {
                corbelEnvUrl = '-' + env;
            }
            grunt.log.oklns('Get Corbel Driver in enviroment = ' + env);

            var corbel = require('../node_modules/corbel-js/dist/corbel.js');

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
            configFile = grunt.file.readJSON('gruntconfig.json');
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

    var tempPageNumber = {};
    /*var maxItems = 0;
     maxItems === 25 ||
     maxItems++;
     */
    function getCorbelCollection(collectionName, env, timestamp, callback) {
        grunt.log.writeln('getCorbelCollection= ' + collectionName + ' on ' + env + ' pageNumber' + tempPageNumber[collectionName]);
        if (!tempPageNumber[collectionName]) {
            tempPageNumber[collectionName] = 0;
        }
        cd.resources.collection('bitbloq:' + collectionName)
            .page(tempPageNumber[collectionName])
            .pageSize(50)
            .get().then(function(response) {
                grunt.log.writeln(collectionName);
                grunt.log.writeln(response.data.length);
                if (response.data.length === 0) {
                    callback(null, [-1]);
                } else {
                    grunt.file.write('./backupsDB/' + timestamp + '/' + collectionName + '_' + tempPageNumber[collectionName] + '.json', JSON.stringify(response.data));
                    tempPageNumber[collectionName] = tempPageNumber[collectionName] + 1;
                    getCorbelCollection(collectionName, env, timestamp, callback);
                }

            }).catch(function(error) {
                console.log('error');
                console.log(error);
                callback(error);
            });

    }

    grunt.registerTask('exportCollectionFromCorbel', function(collectionName, env, timestamp) {
        var done = this.async();
        getAdminToken(env).then(function(response) {
            switch (collectionName) {
                case 'project':
                    migrateProjectsFromCorbelToBitbloq(env, timestamp, done);
                    break;
                case 'user':
                    migrateUsersFromCorbelToBitbloq(timestamp, done);
                    break;
                case 'forum':
                    migrateForumFromCorbelToBitbloq(env, timestamp, done);
                    break;
                default:
                    console.log('Unknow Collection, nothing to do  ¯\\_(ツ)_/¯');
                    done();
            }
        }).catch(function(err) {
            grunt.log.error('create token error');
            grunt.log.error(JSON.stringify(err));
            done(err);
        });

    });

    function migrateProjectsFromCorbelToBitbloq(env, timestamp, callback) {
        var async = require('async');
        async.parallel([
            getCorbelCollection.bind(null, 'Angularproject', env, timestamp),
            getCorbelCollection.bind(null, 'ProjectStats', env, timestamp)
        ], function(err, result) {
            if (err) {
                console.log('err');
                callback(err);
            } else {
                console.log('ok');
                console.log(result[1].length);

                var projects,
                    stats = [],
                    i;
                for (i = 0; i < tempPageNumber['ProjectStats']; i++) {
                    stats = stats.concat(grunt.file.readJSON('./backupsDB/' + timestamp + '/ProjectStats_' + i + '.json'));
                }
                console.log('tempPageNumber[ngularproject]', tempPageNumber['Angularproject']);
                for (i = 0; i < tempPageNumber['Angularproject']; i++) {
                    //console.log('process', i);
                    projects = grunt.file.readJSON('./backupsDB/' + timestamp + '/Angularproject_' + i + '.json');

                    processProjects(projects, stats);
                    grunt.file.write('./backupsDB/' + timestamp + '/Angularproject_' + i + '.json', JSON.stringify(projects));
                }
                grunt.file.write('./backupsDB/' + timestamp + '/Angularproject_tempPageNumber.txt', tempPageNumber['Angularproject']);
                callback();
            }
        });
    }

    function processProjects(projects, stats) {
        var tempStat,
            _ = require('lodash');
        for (var i = 0; i < projects.length; i++) {
            tempStat = _.find(stats, ['id', projects[i].id]);
            if (tempStat) {
                projects[i].timesViewed = tempStat.timesViewed;
                projects[i].timesAdded = tempStat.timesAdded;
            }
            if(!projects[i].creatorId){
                console.log('not creator ID');
                if(projects[i].id && projects[i].id !== 'undefined'){
                    console.log(projects[i].id);
                    console.log(typeof(projects[i].id));
                    projects[i].creatorId = projects[i].id.split(':')[0];
                } else{
                    console.log('not id');
                    for(var propertyName in projects[i]._acl) {
                        console.log(propertyName);
                        if(propertyName){
                            projects[i].creatorId = propertyName.split(':')[1];
                        }
                    }
                }
                console.log(projects[i].creatorId);
                console.log(projects[i].id);
                console.log(projects[i]._acl);
            }

            projects[i].corbelId = projects[i].id;
            projects[i].creator = projects[i].creatorId;
            projects[i].createdAt = projects[i]._createdAt;
            projects[i].updatedAt = projects[i]._updatedAt;

            delete projects[i].id;
            delete projects[i].creatorId;
            delete projects[i].creatorUsername;
            delete projects[i].links;
            delete projects[i].imageType;
            delete projects[i]._createdAt;
            delete projects[i]._updatedAt;
        }
    }

    function parseFalse(value) {
        return !(!value || (value === 'false'));
    }

    function migrateUsersFromCorbelToBitbloq(timestamp, callback) {
        var users = grunt.file.readJSON('./backupsDB/user_iam.json'),
            identities = grunt.file.readJSON('./backupsDB/identity.json'),
            finalUsers = [],
            duplicatedUsername = [],
            usernames = {},
            _ = require('lodash'),
            itemIdentities;
        console.log('We have users, now transform it to Bitbloq and save on backupsDB', timestamp, users.length);
        for (var i = 0; i < users.length; i++) {

            users[i]._id = users[i]._id.$oid;
            if (!usernames[users[i].username.toLowerCase()]) {
                usernames[users[i].username.toLowerCase()] = true;
            } else {
                console.log('duplicated Username');
                duplicatedUsername.push(users[i]);
                while (usernames[users[i].username.toLowerCase()]) {
                    users[i].username = users[i].username + (Math.random() * 6);
                }
                usernames[users[i].username.toLowerCase()] = true;
            }

            if (users[i].email && (users[i]._id !== 'bitbloqadmin')) {

                users[i].birthday = users[i]['properties.birthday'];
                users[i].cookiePolicyAccepted = false;
                users[i].hasBeenWarnedAboutChangeBloqsToCode = false;
                users[i].hasBeenAskedIfTeacher = parseFalse(users[i].properties.hasBeenAskedIfTeacher);
                users[i].takeTour = parseFalse(users[i].properties.tour);
                users[i].language = users[i].properties.language;
                users[i].newsletter = parseFalse(users[i].properties.newsletter);
                users[i].role = 'user';
                users[i].corbelHash = true;

                /*if (users[i].createdDate) {
                    users[i].createdAt = users[i].createdDate.$date;
                }
*/
                users[i].bannedInForum = false;
                var deleteFields = ['id', 'scopes', 'createdBy', 'domain', 'groups', '_createdAt', '_updatedAt', 'createdDate',
                    'properties.hasBeenAskedIfTeacher', 'properties.birthday', 'properties.code', 'properties.language', 'properties.cookiePolicyAccepted', 'properties.connected',
                    'properties.tour', 'properties.term', 'properties.remindSupportModal', 'properties.isTeacher', 'properties.newsletter', 'properties.imageType'
                ];

                for (var j = 0; j < deleteFields.length; j++) {
                    delete users[i][deleteFields[j]]
                }

                itemIdentities = _.filter(identities, function(item) {
                    return item.userId === users[i]._id;
                });
                if (itemIdentities.length > 2) {
                    console.log('two identities');
                    users[i].social = {};
                    for (var k = 0; k < itemIdentities.length; k++) {
                        if (itemIdentities[k].oauthService !== 'silkroad') {
                            users[i].social[itemIdentities[k].oauthService] = {
                                id: itemIdentities[k].oauthId
                            };
                        }
                    }
                    console.log(users[i]);
                }

                finalUsers.push(users[i]);

            } else {
                console.log('wrongUser', users[i]);
            }

        }
        console.log('duplicated', duplicatedUsername.length);
        grunt.file.write('./backupsDB/' + timestamp + '/user.json', JSON.stringify(finalUsers));
        grunt.file.write('./backupsDB/' + timestamp + '/duplicatedUsername.json', JSON.stringify(duplicatedUsername));
        callback();

    }

    function migrateForumFromCorbelToBitbloq(env, timestamp, callback) {
        var async = require('async'),
            _ = require('lodash');
        async.parallel([
            getCorbelCollection.bind(null, 'ForumAnswers', env, timestamp),
            getCorbelCollection.bind(null, 'ForumStats', env, timestamp),
            getCorbelCollection.bind(null, 'ForumThemes', env, timestamp)
        ], function(err, result) {
            if (err) {
                console.log('err');
                callback(err);
            } else {
                console.log('All collections');
                console.log(result[0].length);
                console.log(result[1].length);
                console.log(result[2].length);

                var threads,
                    allThreads = [],
                    allAnswers = [],
                    stats = [],
                    answers;

                var i;
                for (i = 0; i < tempPageNumber['ForumStats']; i++) {
                    stats = stats.concat(grunt.file.readJSON('./backupsDB/' + timestamp + '/ForumStats_' + i + '.json'));
                }
                console.log('tempPageNumber[ForumThemes]', tempPageNumber['ForumThemes']);
                for (i = 0; i < tempPageNumber['ForumThemes']; i++) {
                    console.log('process', i);
                    threads = grunt.file.readJSON('./backupsDB/' + timestamp + '/ForumThemes_' + i + '.json');

                    processThreads(threads, stats);
                    allThreads = allThreads.concat(threads);
                    grunt.file.write('./backupsDB/' + timestamp + '/ForumThemes_' + i + '.json', JSON.stringify(threads));
                }
                grunt.file.write('./backupsDB/' + timestamp + '/ForumThemes_tempPageNumber.txt', tempPageNumber['ForumThemes']);
                grunt.file.write('./backupsDB/' + timestamp + '/ForumThreads.json', JSON.stringify(allThreads));

                console.log('tempPageNumber[ForumAnswers]', tempPageNumber['ForumAnswers']);
                for (i = 0; i < tempPageNumber['ForumAnswers']; i++) {
                    console.log('process', i);
                    answers = grunt.file.readJSON('./backupsDB/' + timestamp + '/ForumAnswers_' + i + '.json');

                    processAnswers(answers);
                    allAnswers = allAnswers.concat(answers);
                    grunt.file.write('./backupsDB/' + timestamp + '/ForumAnswers_' + i + '.json', JSON.stringify(answers));
                }
                grunt.file.write('./backupsDB/' + timestamp + '/ForumAnswers_tempPageNumber.txt', tempPageNumber['ForumAnswers']);
                grunt.file.write('./backupsDB/' + timestamp + '/ForumAnswers.json', JSON.stringify(allAnswers));
                callback();
            }
        });
    }

    function processThreads(threads, stats) {
        var tempStat,
            _ = require('lodash'),
            deleteFields = ['id', 'links', '_createdAt', '_updatedAt', 'categoryId', 'lastAnswerDate'];
        for (var i = 0; i < threads.length; i++) {
            tempStat = _.find(stats, ['id', threads[i].id]);
            if (tempStat) {
                threads[i].numberOfViews = tempStat.timesViewed;
            }
            //check if creator its _id or id
            threads[i]._id = threads[i].id;
            threads[i].creator = threads[i].creator.id;
            threads[i].category = threads[i].categoryId;
            threads[i].createdAt = threads[i]._createdAt;
            threads[i].updatedAt = threads[i]._updatedAt;

            for (var j = 0; j < deleteFields.length; j++) {
                delete threads[i][deleteFields[j]]
            }
        }
    }

    function processAnswers(answers) {
        var tempStat,
            _ = require('lodash'),
            tempThread,
            deleteFields = ['links', '_createdAt', '_updatedAt', 'owner', 'themeId'];
        for (var i = 0; i < answers.length; i++) {
            //check if creator its _id or id
            answers[i].creator = answers[i].owner.id;
            answers[i].createdAt = answers[i]._createdAt;
            answers[i].updatedAt = answers[i]._updatedAt;
            answers[i].thread = answers[i].themeId;
            var tempArray = [];
            if (answers[i].images) {
                for (var k = 0; k < answers[i].images.length; k++) {
                    tempArray.push(answers[i].images[k].id);
                }
                answers[i].images = tempArray;
            }

            for (var j = 0; j < deleteFields.length; j++) {
                delete answers[i][deleteFields[j]]
            }
        }
    }

    // grunt importCollectionsFromCorbel:next:qa
    // grunt importCollectionsFromCorbel:production:qa
    grunt.registerTask('importCollectionsFromCorbel', function(corbelEnv, backEnv) {
        var fs = require('fs'),
            timestamp = Date.now();
        fs.mkdirSync('./backupsDB/' + timestamp);
        grunt.task.run([
            //'exportCollectionFromCorbel:project:' + corbelEnv + ':' + timestamp,
            'importProjectFromCorbel:' + timestamp,
            //'exportCollectionFromCorbel:user:' + corbelEnv + ':' + timestamp,
            //'importUsersFromCorbel:' + timestamp
            'exportCollectionFromCorbel:forum:' + corbelEnv + ':' + timestamp,
            'importForumFromCorbel:' + timestamp
        ]);
    });

};
