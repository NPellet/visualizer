

module.exports = function(grunt) {


    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        uglify: {

            './dist/jsnmr.min.js': [ './src/nmr.js', './src/assignation.js' ]

        },

        copy: {

            dist: {

                files: {
                    './dist/jsnmr.js': [ './src/nmr.js', './src/assignation.js' ]
                }    
            }
            
        },

        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [ 'pkg' ],
                push: false
            }
        }
    });



    var fs = require('fs');

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-sloc');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-bump');

    grunt.registerTask('default', [ 'uglify', 'concatSource', 'concatMin' ]);


    function processSource( source ) {

        return source
                .join("\n")
                .replace( /@VERSION/g, grunt.config('pkg').version )
                .replace( /@DATE/g, ( new Date() ).toISOString().replace( /:\d+\.\d+Z$/, "Z" ) );

    }


    grunt.registerTask( 'concatSource', 'Concat all src files', function() {

        var source = [ './src/build_utils/header.js', './src/nmr.js', './src/assignation.js' ];
        source = source.map( function( path ) {
            return grunt.file.read( path );
        })
        
        grunt.file.write( './dist/jsnmr.js', processSource( source ) );

    });


    grunt.registerTask( 'concatMin', 'Concat all src files', function() {

        var source = [ './src/build_utils/header.min.js', './dist/jsnmr.min.js' ];
        source = source.map( function( path ) {
            return grunt.file.read( path );
        })
        
        grunt.file.write( './dist/jsnmr.min.js', processSource( source ) );

    });
};