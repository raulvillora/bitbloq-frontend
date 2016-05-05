module.exports = function(grunt) {
    grunt.registerTask('updateCollection', function(collection, env, setId) {
        grunt.log.writeln('Updating= ' + collection + ' on ' + env + ' setting the ID:' + setId);
        var done = this.async(),
            item = grunt.file.readJSON('dataBaseFiles/' + collection + '/' + collection + '.json');
        //refreshCorbelCollection('bitbloq:' + collection, item, env, setId, done);
        done();
    });
};