var fs = require('fs');
var jsonfile = require('jsonfile');
var workspaceManager = require('./workspace-manager-lib.js');

// plugin-reader-lib.js
// ========
module.exports = {
    listPluginsFiles : function(path, callback) {
        workspaceManager.listDirRecursive(path, ["cfg"], callback);    
    },

    readJSONFiles: function(files, callback) {
        var filesObj = [];
        
        if (files.length > 0) {
            var filesCopy = Array(files.length);
            i = files.length;
            while(i--) filesCopy[i] = files[i];

            var readFileCallback = function(err, obj) {
                if (err) {
                    callback(err, null);
                } else {
                    console.log(obj);
                    filesObj.push(obj);

                    if(filesCopy.length > 0) {
                        var nextFile = filesCopy[filesCopy.length - 1];
                        filesCopy.pop();

                        console.log("processing file: " + nextFile);
                        jsonfile.readFile(nextFile, readFileCallback);    
                    } else {
                        callback(null, filesObj);
                    }
                }
            };

            var nextFile = filesCopy[filesCopy.length - 1];
            filesCopy.pop();

            console.log("processing file: " + nextFile);
            jsonfile.readFile(nextFile, readFileCallback);
        } else {
            callback(null, filesObj);
        }
    }
};