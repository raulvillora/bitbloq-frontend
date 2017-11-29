var fs = require('fs');

// workspace-manager-lib.js
// ========
module.exports = {

    listDirRecursive: function (directoryPath, extensions, callback) {
        var files = [];
        var directories = [];

        var processDirCallBack = function(err, actualFiles, actualDirectories) {
            if(err) {
                callback(err, null);
            } else {
                files = files.concat(actualFiles);
                directories = directories.concat(actualDirectories);

                if (directories.length > 0) {
                    var nextDir = directories[directories.length - 1];
                    directories.pop();

                    processDirectory(nextDir,extensions, processDirCallBack);
                } else {
                    callback(null, files);
                }     
            } 
        };

        processDirectory(directoryPath, extensions, processDirCallBack);
    },

    checkWorkspaceSync : function(userFolder, workspaceFolder) {
        var path = userFolder + "/" + workspaceFolder;
        checkFolderSync(path, "workspace");   
    },

    checkPluginsFolderSync : function(workspacePath, pluginFolder) {
        var path = workspacePath + "/" + pluginFolder;
        checkFolderSync(path, "plugins folder");
    },

    checkProtocolsFolderSync : function(workspacePath, protocolsFolder) {
        var path = workspacePath + "/" + protocolsFolder;
        checkFolderSync(path, "protocols folder");   
    },

    checkMachinesFolderSync : function(workspacePath, machinesFolder) {
        var path = workspacePath + "/" + machinesFolder;
        checkFolderSync(path, "machines folder");
    },
    
    checkTemporalFilesFolderSync : function(workspacePath, temporalFiles) {
        var path = workspacePath + "/" + temporalFiles;
        checkFolderSync(path, "temporal files");
    },
    
    getOnlyFilesNamesSync : function(paths) {
        var onlyNames = []
        for(var i=0; i < paths.length; i++) {
            var path = paths[i];
            
            var position = path.lastIndexOf("/");
            if (position == -1) {
                position = path.lastIndexOf("\\");
            }
            
            if (position != -1) {
                var name = path.substr(position + 1, path.length);
                onlyNames.push(name);
            }
        }
        return onlyNames;
    },
    
    removeWorkingPathsSync : function(workingPaths, paths) {
        var onlyNames = []
        for(var i=0; i < paths.length; i++) {
            var path = paths[i];
            
            var position = path.indexOf(workingPaths);
            if (position != -1) {
                var name = path.substr(position + workingPaths.length + 1, path.length);
                onlyNames.push(name);
            }
        }
        return onlyNames;
    }
};

var checkFolderSync = function(path, folderName) {
    if (!fs.existsSync(path)) {
        // create plugin folder
        console.log('%s\x1b[31m%s\x1b[0m%s', folderName + "[", "NOT FOUND", "]");
        console.log("creating a new one...");
        fs.mkdirSync(path);
    } else {
        console.log('%s\x1b[32m%s\x1b[0m%s', folderName + "[", "OK", "]");
    }
};

var processDirectory = function (path, extensions, callback) {
    fs.readdir(path, function(err, items) {
        var files = [];
        var directories = [];

        if (err) 
            callback(err, null, null);
        else {
            for (var i=0; i<items.length; i++) {
                var path_item = path + '/' + items[i];

                if (fs.lstatSync(path_item).isDirectory()) {
                    directories.push(path_item);
                } else {
                    if (extensions != null) {
                        var actualExtension = items[i].split('.').pop();
                        if (extensions.indexOf(actualExtension) != -1) {
                            files.push(path_item);
                        }
                    } else {
                        files.push(path_item);    
                    }
                }
            }
            callback(null, files, directories);
        }
    });
};