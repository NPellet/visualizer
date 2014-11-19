

module.exports = function(grunt) {


    grunt.initConfig({


        pkg: grunt.file.readJSON('package.json'),

        build: {

            maximal: {
                
                output: 'dist/jsgraph.js'
            },

            minimal: {
                
                output: 'dist/jsgraph.js'
            }
        },


        bump: {

            options: {
                files: ['package.json'],
                updateConfigs: [ 'pkg' ],
                push: false
            }
    
        },

        sloc: {
           'graphs': {
                files: {
                    './src/': [ '**.js' ],
                   
                }
            }
        },

        uglify: {
            dist: {
              files: {
                'dist/jsgraph.min.js': ['dist/jsgraph.js']
              }
            }
        }

    });


    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-sloc');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    function convert() {

        grunt.log.writeln( arguments );
    }

    grunt.registerMultiTask( 'build', 'Build jsGraphs distributions', function() {

        var done = this.async();
        var targetOutput = this.data.output;
        var rdefineEnd = /\}\s*\)\s*;[^}\w]*$/;

        var version = grunt.config('pkg').version;
        grunt.log.writeln( version );

        var buildConvert = function( name, path, contents ) {
//            return contents;

            //grunt.log.writeln( path, fs.fstatSync( path ) );

            // Convert var modules
       /*     if ( /.\/var\//.test( path ) ) {
                contents = contents
                    .replace( /define\([\w\W]*?return/, "var " + (/var\/([\w-]+)/.exec(name)[1]) + " =" )
                    .replace( rdefineEnd, "" );

            } else {
*/


                if( name !== 'graph' ) {
                    matches = contents
                        .match( /define\s*\(\s*'([^']*)'\s*,\s*\[\s*(.*)\s*\]\s*,\s*function\s*\(\s*([^)]*)\s*\)/i );

                    if( ! matches ) {
                        grunt.log.writeln("Possible error for file " + name + "(" + path + "). No define found");
                        grunt.log.writeln("Trying anonymous module");

                         matches = contents
                            .match( /define\s*\(\s*\[\s*(.*)\s*\]\s*,\s*function\s*\(\s*([^)]*)\s*\)/i );
                        
                        if( ! matches ) {
                            grunt.log.writeln("Still nothing...");
                            grunt.log.writeln("Skipping inclusion");
                            return "";
                        } else {
                            // Insert the current name in the matches
                            matches.splice( 1, 0, name );
                            grunt.log.writeln("Ok we're good");
                        }

                    }

                    contents = contents
                        .replace( /define\([^{]*?{/, "" )
                        .replace( rdefineEnd, "" );


                    var defineName = matches[ 1 ];
                    // For some reason defineName does not contain the original "./" ...

                    var dependencies = matches[ 2 ].split(",");
                    var objects = matches[ 3 ].split(',').map( function( val ) {

                        if( val.length == 0 || val.indexOf('require') > -1 ) return null;

                        return val;
                    }).join();
                    
                    var basePath = npmpath.resolve('.') + "/";
                    var defineName = npmpath.resolve( defineName );

                    defineName = "./" + defineName.replace( basePath, "" );

                    dependencies = dependencies.map( function( val ) { 

                        if( val.length == 0 || val.indexOf('require') > -1 ) {
                            return null;
                        }

                        var val = val.replace(/^\s*?['"]([^'"]*)['"]\s*?$/, "$1");
                        val = npmpath.resolve( npmpath.dirname( path ), val );
    

                        val = "./" + val.replace( basePath, "" ).replace( /^src\//, "" );

                        return 'build["' + val + '"]';

                    } );



                    contents = "build['" + defineName + "'] = ( function( " + objects + ") { " + contents + " } ) ( " + dependencies.join() + " );\n"; 
                } else {

                    contents = "return build[ './graph.core' ];\n";
                   
                }



                // Remove anything wrapped with
                // /* ExcludeStart */ /* ExcludeEnd */
                // or a single line directly after a // BuildExclude comment
                contents = contents
                    .replace( /\/\*\s*ExcludeStart\s*\*\/[\w\W]*?\/\*\s*ExcludeEnd\s*\*\//ig, "" )
                    .replace( /\/\/\s*BuildExclude\n\r?[\w\W]*?\n\r?/ig, "" );

                // Remove empty definitions
                contents = contents
                    .replace( /define\(\[[^\]]+\]\)[\W\n]+$/, "" );
            
                // Remove empty lines
                contents = contents
                    .replace(/^\s*\"use strict\";\s*(\s)/ig, "$1" );
            //    }

                contents = contents
                    .replace(/ /ig, " " );

                
            contents = 

            "/* \n" +
            " * Build: new source file \n" +
            " * File name : " + name + "\n" + 
            " * File path : " + path + "\n" + 
            " */\n\n" +

            contents + 
            "\n\n" + 
            "// Build: End source file (" + name + ") \n\n\n\n";

            return contents;
        }



        var requirejs = require('requirejs'),
            fs = require('fs'),
            npmpath = require('path'),
            requirejsConfig = {

                // It's all in the src folder
                baseUrl: "src",

                // Look out for the module graph
                name: "graph",
                
                // No optimization
                optimize: "none",

              
                wrap: {
                    startFile: "./src/build_utils/startfile.js",
                    endFile: "./src/build_utils/endfile.js"
                },


                paths: {
                    'jquery': '../lib/components/jquery/dist/jquery.min'
                },

                // Taken from the jquery build task
                onBuildWrite: buildConvert,

                exclude: [ 'jquery' ],
                //useStrict: true,

                out: function( compiled ) {

                    compiled = compiled
                        .replace( /@VERSION/g, version )
                        .replace( /@DATE/g, ( new Date() ).toISOString().replace( /:\d+\.\d+Z$/, "Z" ) );

                    // Write concatenated source to file
                    grunt.file.write( targetOutput, compiled );
                 }



        //targetOutput || './dist/graphs.js'
            };




        requirejs.optimize( requirejsConfig, function() {
            
            done();

        }, function( error ) {

            done( error );
        } );
    } );
};
