module.exports = function(grunt) {

  var modulesFinal = {};
  var modulesStack = {};
  var _ = require('underscore');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    

    uglify: {
      build: {
        

        files: [
          {
            expand: true,     // Enable dynamic expansion.
            cwd: './build2/',      // Src matches are relative to this path.
            src: [
              'init.js',
              'modules/**/*.js',
              'lib/**/*.js',
              '!lib/jsmol/**/*.js'
            ], // Actual pattern(s) to match.
            dest: './build2/',   // Destination path prefix.
            //overwrite: true,
            ext: '.js',   // Dest filepaths will have this extension.
          }
        ]    
      }
    },

    copy: {

      buildLib: {
        
        files: [ {
            expand: true,
            cwd: './src/components/',
            src: [
              './d3/d3.min.js',
              './fancytree/src/jquery.fancytree*.js',
              './fancytree/src/skin-lion/*',
              './jqgrid_edit/js/*.js',
              './jqgrid_edit/js/i18n/grid.locale-en.js',
              './jqgrid_edit/css/*.css',
              './jquery/jquery.min.js',
              './jquery/jquery-migrate.min.js',
              './jquery-ui/ui/minified/jquery-ui.min.js',
              './three.js/build/three.min.js',
              './ace/lib/ace/**',
              './ckeditor/skins/**',
              './ckeditor/ckeditor.js',
              './ckeditor/styles.js',
              './ckeditor/contents.css',
              './ckeditor/adapters/jquery.js',
              './ckeditor/lang/en.js',
              './ckeditor/plugins/**',
              './farbtastic/src/farbtastic.js',
              './jquery.threedubmedia/event.drag/jquery.event.drag.js',
              './sprintf/src/sprintf.min.js',
              './requirejs/require.js',
              './jquery-throttle-debounce/jquery.ba-throttle-debounce.min.js',
              './Aristo-jQuery-UI-Theme/css/Aristo/images/*',
              './Aristo-jQuery-UI-Theme/css/Aristo/*.css',
              './x2js/xml2json.min.js',
              './leaflet/**',
              './jsoneditor/jsoneditor-min*',
              './jsoneditor/img/*',
              './jit/Jit/**/*',
              './jquery-ui-contextmenu/jquery.ui-contextmenu.min.js',
              './mustache/mustache.js',
              './papa-parse/jquery.parse.min.js',
              './font-awesome/css/font-awesome.min.css',
              './font-awesome/fonts/*',
              './colors/css/colors.min.css'
            ],

            dest: './build/components/'

          },

          {
            expand: true,
            cwd: './src/lib/',
            src: [ './chemdoodle/**' ],
            dest: './build/lib/'
          },

          {
            expand: true,
            cwd: './src/components/',
            src: [
              './Aristo-jQuery-UI-Theme/css/Aristo/images/*',
              './Aristo-jQuery-UI-Theme/css/Aristo/*.css'
            ],
            dest: './build/components/jqueryui/'
          },
        ]
      },

      build: {

        files: [
          {
            expand: true,
            cwd: './src/',
            src: ['./index.html', 'init.js', 'css/**', 'bin/**', 'lib/**', 'src/**', 'data/**'],
            dest: './build/'
          }
        ]
      },

      buildUsr: {

        files: [{
          expand: true,
          cwd: (grunt.option('usr') || './src/usr') + '/filters/',
          src: '**',
          filter: function( filePath ) {
            var files = grunt.option('filterFiles');
            for( var i = 0, l = files.length ; i < l ; i ++ ) {
              if( path.relative( (grunt.option('usr') || './src/usr') + '/filters/' + files[ i ], filePath) == "" ) {
                return true;
              }
            }

            return false;
            
          },
          dest: './build/usr/filters/'
        }, 

        {
          expand: true,
          cwd: grunt.option('usr') || './src/usr',
          src: '**',
          filter: function(filePath){
            var forbiddenTerms = ['config', 'filters', 'modules'];
            var isForbidden = _.map(forbiddenTerms, function(term) {
              return (filePath.search(path.join(grunt.option('usr') || './src/usr', term)) > -1);
            });
            
            if(_.some(isForbidden)) {
              return false;
            }
            return true;
          },
          dest: './build/usr/'
        }]
      },

      buildModules: {
        // Modules defined in usr folder
        files: [{
          expand: true,
          cwd: grunt.option('usr') || './src/usr',
          src: ['./modules/**'],
          dest: './build/usr/',
          filter: function(filepath) {
            // console.log('filepath:', filepath);
            filepath = filepath.replace(/\\/g,"/");
            for( var i in modulesStack ) {
              // console.log(i);
              if( filepath.indexOf( i ) > -1 ) {
                return true;
              }
            }
            return false;
          }
        }, 
        {
          expand: true,
          cwd: './src/',
          src: ['./modules/**' ],
          dest: './build/',
          filter: function(filepath) {
            filepath = filepath.replace(/\\/g,"/");
            for( var i in modulesStack ) {
              if( filepath.indexOf( i ) > -1 ) {
                return true;
              }
            }
            return false;
          }
        },
        {
          expand: true,
          cwd: './src/',
          src: ['./modules/module.js', './modules/modulefactory.js', './default/**', './modules/default/**' ],
          dest: './build/'
        }

        ]
      }
    },

  
    clean: {

      build: {
        src: [ 'build' ]
      },

      buildTemp: {
        src: [ 'build2' ]
      },

      modules: {
         src : [ "build/modules/**/.DS_Store" ]
      },

      modulesJson: {
        src: [ "build/modules/**/*.json" ],
        filter: function(filepath) {
          return ( ! filepath.match("/lib/") && ! filepath.match(/folder\.json$/) );
        }
      },

      modulesJsonErase: {
         src: [ "src/modules/**/*.json" ],
         filter: function(filepath) {
           return ( ! filepath.match("/lib/") );
         }
      }
    },

    rename: {

      afterBuild: {
          src: 'build2',
          dest: 'build'
      }
    },

    requirejs: {
        
        compile: {
          options: {
            "dir": "./build2/",
            "appDir": "./build/",
            "baseUrl": "./",
            "optimizeCss": "none",
            "optimize": "none",
            "removeCombined": true,
            "paths": {
              "jquery": "empty:",
              "require": "empty:",

              "ace": "empty:",
              "d3": "empty:",
              "fancytree": "empty:",
              "jqgrid": "empty:",
              "jqueryui": "empty:",
              "threejs": "empty:",
              "ckeditor": "empty:",
              "forms": "empty:",
              "plot": "empty:",
              'ChemDoodle': 'empty:'

            },
            "modules": [
              { 
                name: 'init'
              }
            ]
          }
        }
      },

      ftp: {                                            // Task
        options: {                                    // Options
            host: 'cheminfo.epfl.ch',
            user: 'npellet',
            pass: 'pass77'
        },
        upload: {                                    // Target
            files: {                 
                           // Dictionary of files
                '/usr/local/www/sites/cheminfo.epfl.ch/site/firmenich/build/': 'build/**/*.*'                // remote destination : source
            }
        }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-rename');
  grunt.loadNpmTasks('grunt-ftp');

  var fs = require('fs');
  var path = require('path');
  var $ = require('jQuery');

  grunt.registerTask( 'upload', [ 'ftp' ] );
  
  grunt.registerTask('clean-images', 'Clean all images that are not used in the build', function(){
    var walk = require('walk');
    var fs = require('fs');
    var walk = require('walk')
        , fs = require('fs')
        , options
        , walker
        , whiteset = {}
        , allimages = [];

      // To be truly synchronous in the emitter and maintain a compatible api,
      // the listeners must be listed before the object is created
      options = {
        listeners: {
          file: function (root, fileStats, next) {
            var expressions;
            expressions = [new RegExp(/\.jpg$/), new RegExp(/\.png$/), new RegExp(/\.jpeg$/), new RegExp(/\.gif$/)];
            if(_.any(expressions, function(exp){
              return fileStats.name.match(exp);
            })) {
              allimages.push(root+'/'+fileStats.name);
            }
          
            var expressions = [new RegExp(/\.css$/), new RegExp(/\.js$/), new RegExp(/\.html$/)];
            if(_.any(expressions, function(exp){
              return fileStats.name.match(exp);
            })) {
              // File content
              var content = fs.readFileSync(root+'/'+fileStats.name).toString();
              
              // Search for icons specified using the forms library
              if(fileStats.name.match(new RegExp(/\.js$/))) {
                var formreg = RegExp(/require\(\[['"]\.\/forms\/form['"]\]/);
                if(content.match(formreg)) {
                  var iconreg = RegExp(/icon:\s*['"]([a-zA-Z_\-]+)['"]/g);
                  var m = iconreg.exec(content);
                  while (m != null) {
                      whiteset['build/lib/forms/images/'+m[1]+'.png'] = '';
                      m = iconreg.exec(content);
                  }
                }
              }
              
              // Search for images specified in .js, .css and .html files
              var expression = /[\/a-zA-Z_\- 0-9]+\.(png|jpeg|jpg|gif)/gi;
              var reg = RegExp(expression);
              var res = content.match(reg);
              if(res) {
                _.keys(res).forEach(function(i){
                  if(res[i][0] !== '/') { // ignore absolute path
                    var filepath = root+'/'+res[i];
                    if(fs.existsSync(filepath)) {
                      whiteset[filepath] = '';
                    }
                  }
                });
              }
              next();
            }
          }
        , errors: function (root, nodeStatsArray, next) {
            console.log('An error occured in walk');
            next();
          }
        }
      };

      walker = walk.walkSync("build", options);
      
      // Delete images that are not in the white set
      var delcount = 0;
      _.keys(allimages).forEach(function(i){
        if(!_.has(whiteset, allimages[i])) {
          fs.unlinkSync(allimages[i]);
          delcount++;
        }
      });
      console.log('Deleted ' + delcount + ' out of '+ allimages.length + ' images.')
  });
  
  grunt.registerTask('couchdb:copyModules', function() {
    file = grunt.file.readJSON('build/default.json');
    fs.writeFileSync('./build/modules/types/folder.json', JSON.stringify(file.modules));
  }); 
  
  grunt.registerTask( 'build', [
                        'clean:build',
                        'buildProject',
                        'copy:buildModules',
                        'copy:buildUsr',
                        'copy:build',
                        'copy:buildLib',
                        'couchdb:copyModules',
                        'requirejs',
                        'uglify:build',
                        'clean:build',
                        'rename:afterBuild'
                    ] );
    
  grunt.registerTask( 'buildProject', 'Build project', function() {

/*
    if( ! fs.existsSync('./build/') ) {
*/
      fs.mkdirSync( 'build/');
  //  }

    var config = grunt.option('config') || './src/usr/config/default.json';

    if( ! fs.existsSync( config ) ) {
      console.log( 'File config (' + config + ') does not exist');
      return;
    }


    var cfg = grunt.file.readJSON( config ),
        file,
        modules = {},
        jsonStructure = {};

    function loadFile() {
      var fileName;
      if(typeof arguments[0] === 'object') {
        fileName = arguments[0];
      }
      else if(arguments.length === 1) {
        fileName = './src/' + arguments[0];
      }
      else {
        fileName =  arguments[1] + arguments[0];
      }
      var file,
          j = 0,
          i = 0,
          l,
          jsonStructure = { modules: [], folders: {} };
//console.log( fileName );
      if( typeof fileName !== "object" ) {

        if( ! require('fs').existsSync( fileName ) ) {
          if(arguments.length === 1) {
            return loadFile(arguments[0], grunt.option('usr')+'/');
          }
          console.log( 'Folder file ' + fileName + ' does not exist');
          return;
        }
        console.log( 'Fetching file ' + fileName);
        file = grunt.file.readJSON( fileName );
      }
      else {
        file = fileName;
      }
      
      for( var k in file.folders ) {
        if(arguments.length === 1) {
          jsonStructure.folders[k] = loadFile(file.folders[k] + 'folder.json')
        }
        else {
          console.log('load file:', file.folders[k]+'folder.json', arguments[1]);
          jsonStructure.folders[k] = loadFile(file.folders[k] + 'folder.json', arguments[1])
        }
        // jsonStructure.folders[ k ] = loadFile( './src/' + file.folders[ k ] + 'folder.json');
      }

      if( file.modules ) {
        for( j = 0, l = file.modules.length ; j < l ; j ++ ) {
          modules[ file.modules[ j ].url ] = true;
          modulesStack[ file.modules[ j ].url ] = true;
          if(arguments.length === 2) {
           file.modules[j].url = './usr/' + file.modules[j].url; 
          }
          console.log('module added: ', file.modules[j]);
          jsonStructure.modules.push( file.modules[ j ] );
        }
      }
      
      return jsonStructure;
    }

    
    for( var i = 0, l = cfg.modules.length ; i <l ; i ++ ) {
      console.log( typeof cfg.modules[ i ] );
      console.log( cfg.modules[ i ] );
      if( typeof cfg.modules[ i ] == "object" ) {
          $.extend( true, modulesFinal, loadFile( cfg.modules[ i ] ) ); 
      } else {
        $.extend( true, modulesFinal, loadFile(cfg.modules[ i ] ) );
//        console.log( loadFile( './src/' + cfg.modules[ i ] ) );
 //       console.log( "___" );
      } 
    }
    
    /* Find filter files from the config.json and puts them in an option */
    var filterFiles = [];
    for( var i in cfg.filters ) {
      filterFiles.push( cfg.filters[i].file );
    }
    grunt.option('filterFiles', filterFiles);
    /* */

    //modulesFinal = modules;
    cfg.modules = modulesFinal;
    
    //fs.writeFileSync( './build/modules.json', JSON.stringify( jsonStructure, false, '\t' ) );
    //cfg.modules = jsonStructure;//'./modules.json';
    fs.writeFileSync( './build/default.json', JSON.stringify( cfg, false, '\t' ) );
    //grunt.task.run('clean:buildTemp');
  });

  // Takes care of module jsons
  grunt.registerTask( 'eraseModuleJsons', [ 'clean:modulesJsonErase' ] );
  grunt.registerTask( 'createJSONModules', 'Create all modules json', function() {    
    function recurseFolder( basePath, relPath ) {

      var folders = fs.readdirSync( basePath ),
          allFolders = [],
          allModules = [],
          containsModule = false,
          target = {},
          subFolder;

      for( var i = 0, l = folders.length ; i < l ; i ++ ) {
        if( ! fs.statSync( basePath + "/" + folders[ i ] ).isDirectory( ) || folders[ i ] == 'lib') {
            continue;
        }

        if( fs.existsSync(basePath + "/" + folders[ i ] + '/model.js') ) {
          allModules.push( folders[ i ] );  
        } else {
          allFolders.push( folders[ i ] );  
        }
        
        containsModule = containsModule || fs.existsSync(basePath + "/" + folders[ i ] + '/model.js');
      }

      if( allFolders.length == 0 && allModules.length == 0 ) {
        return;
      }


      target.modules = [];
      for( var i = 0, l = allModules.length ; i < l ; i ++ ) {
        var el = /moduleName(?:[: ]*)(?:'|")([a-zA-Z0-9 _-]*)(?:'|")/.exec( grunt.file.read( basePath + "/" + allModules[ i ] + "/controller.js" ) );


        target.modules.push({
          "moduleName": (el[ 1 ] || allModules[ i ]),
          "url": ( relPath ) + "/" + allModules[ i ] + "/"
        });
      }

      target.folders = {};
      for( var i = 0, l = allFolders.length ; i < l ; i ++ ) {
        recurseFolder( basePath + "/" + allFolders[ i ], relPath + "/" + allFolders[ i ] );

        if( fs.existsSync( basePath + "/" + allFolders[ i ] + "/folder.json" ) ) {
          subFolder = grunt.file.readJSON( basePath + "/" + allFolders[ i ] + "/folder.json" );
          target.folders[ subFolder.name ] = relPath + "/" + allFolders[ i ] + "/"
        }
      }

      if( fs.existsSync( basePath + '/folder.json') ) {
        var json = grunt.file.readJSON( basePath + '/folder.json' );
        json.folders = target.folders;
        json.modules = target.modules;

        target = json;

      } else {
        target.name = basePath.split('/').pop();
      }

      fs.writeFileSync(basePath + '/folder.json', JSON.stringify( target, null, "\t") );
    }

    recurseFolder( './src/modules/types', 'modules/types' );
    recurseFolder( './src/usr/modules', 'usr/modules' );
  });

};
