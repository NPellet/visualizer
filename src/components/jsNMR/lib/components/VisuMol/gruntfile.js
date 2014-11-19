

module.exports = function(grunt) {

    grunt.initConfig({
        sass: {                                    

            dist: {                                
                files: {
                    'style.css': 'style.scss'
                }
            },

            lib: {                                
                files: {
                    './src/style/style.css': './src/style/style.scss'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.registerTask('default', ['sass']);

};