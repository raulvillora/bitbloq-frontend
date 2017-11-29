var randomstring = require("randomstring"); //generate random string for the server execution
var fs = require('fs'); //i/o access to local file system

// plugin-reader-lib.js
// ========
module.exports = {
    creteTemporalFile : function(path, callback) {
        var name = randomstring.generate({length : 10, charset: 'alphabetic'}) + ".txt";
        var filePath = path + "/" + name;
        fs.writeFile(filePath, "", function(err) {
            if(err) {
                callback(err, null);
            } else {
                callback(null, filePath);
            }
        }); 
    },
    
    writeDataValues : function(file, data, callback) {
        var fileData = "";
        var values = data.split(",");
        for(var i=0; i < values.length; i++) {
            var value = parseInt(values[i].trim());
            if (!isNaN(value)) {
                fileData = value.toString() + "\n";
            }
        }
        
        fs.writeFile(file, fileData, function(err) {
            if(err) {
                callback(err);
            } else {
                callback(null);
            }
        });     
    }
};