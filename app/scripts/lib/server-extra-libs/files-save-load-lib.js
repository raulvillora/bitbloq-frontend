var fs = require('fs');
var workspaceManager = require('./workspace-manager-lib.js');

// save-load-files-lib.js
// ========
module.exports = {
    listEditableFiles : function(path, callback) {
        workspaceManager.listDirRecursive(path, ["xml"], callback);    
    },

    listExecutableFiles : function(path, callback) {
        workspaceManager.listDirRecursive(path, ["json"], callback);    
    },

    saveFile : function(name, protocolLocation, executeText, editText, callback) {
        var executeFilePath = protocolLocation + "/" + name + ".json";
        fs.writeFile(executeFilePath, executeText, function(err) {
            if(err) {
                callback(err);
            }

            var editFilePath = protocolLocation + "/" + name + ".xml";
            fs.writeFile(editFilePath, editText, function(err) {
                if(err) {
                    callback(err);
                } else {
                    callback(null);
                }    
            });
        });
    },

    prepareFileLocation : function(protocolName, path, callback) {
        var protocolPath = path + "/" + protocolName;
        if (!fs.existsSync(protocolPath)) {
            fs.mkdir(protocolPath, function(err) {
                if(err) {
                    callback(err, null);
                } else {
                    callback(null, protocolPath);
                }          
            });      
        } else {
            callback("a proyect with that name already exists", null);
        }   
    }           
};