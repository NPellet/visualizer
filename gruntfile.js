module.exports = function (grunt) {

    var walk = require('walk'),
        fs = require('fs'),
        _ = require('underscore'),
        mkpath = require('mkpath'),
        path = require('path'),
        extend = require('extend');

    var usrPath = grunt.option('usr') || './src/usr';

    function mapPath(path) { // Map a relative application path to a relative build path
        var mapped;
        if (path.indexOf('usr/') === 0)
            mapped = usrPath + path.substr(3);
        else
            mapped = './src/' + path;
        if (mapped.indexOf('.js') === -1)
            mapped += '.js';
        return mapped;
    }

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
                            '!modules/**/lib/**/*.js',
                            'src/**/*.js',
                            '!lib/**/*',
                            'lib/forms/**/*.js',
                            'lib/twigjs/*.js',
                            'lib/webtoolkit/*.js',
                            'lib/chemistry/*.js',
                            'lib/loadingplot/*.js'
                        ], // Actual pattern(s) to match.
                        dest: './build2/',   // Destination path prefix.
                        //overwrite: true,
                        ext: '.js'   // Dest filepaths will have this extension.
                    }
                ]
            }
        },
        copy: {

            buildLib: {

                files: [
                    {
                        expand: true,
                        cwd: './src/components/',
                        src: [
                            './d3/d3.min.js',
                            ['./fancytree/dist/jquery.fancytree*.js', './fancytree/dist/skin-lion/*'],
                            ['./jqgrid_edit/js/*.js', './jqgrid_edit/js/i18n/grid.locale-en.js', './jqgrid_edit/css/*.css'],
                            ['./jquery/jquery.min.js', './jquery/jquery-migrate.min.js'],
                            './jquery-ui/ui/minified/jquery-ui.min.js',
                            './threejs/build/three.min.js',
                            './ace/lib/ace/**',
                            ['./ckeditor/skins/**', './ckeditor/ckeditor.js', './ckeditor/styles.js', './ckeditor/contents.css', './ckeditor/adapters/jquery.js', './ckeditor/lang/en.js', './ckeditor/plugins/**', './ckeditor/config.js'],
                            './farbtastic/src/farbtastic.js',
                            './jquery.threedubmedia/event.drag/jquery.event.drag.js',
                            './sprintf/dist/sprintf.min.js',
                            './requirejs/require.js',
                            './jquery-throttle-debounce/jquery.ba-throttle-debounce.min.js',
                            ['./Aristo-jQuery-UI-Theme/css/Aristo/images/*', './Aristo-jQuery-UI-Theme/css/Aristo/*.css'],
                            './x2js/xml2json.min.js',
                            './leaflet/dist/**',
                            ['./jsoneditor/jsoneditor.min*', './jsoneditor/img/*'],
                            './jit/Jit/**/*',
                            './jquery-ui-contextmenu/jquery.ui-contextmenu.min.js',
                            './papa-parse/papaparse.min.js',
                            ['./font-awesome/css/font-awesome.min.css', './font-awesome/fonts/*'],
                            './colors/css/colors.min.css',
                            './pouchdb/dist/pouchdb.min.js',
                            './uri.js/src/*.js',
                            './twig.js/twig.*',
                            './bluebird/js/browser/bluebird.js',
                            './onde/src/*',
                            ['./spectrum/spectrum.js', './spectrum/spectrum.css'],
                            './superagent/superagent.js',
                            './modernizr/modernizr.js',
                            './underscore/underscore-min',
                            './lodash/dist/lodash.min.js',
                            './bowser/bowser.min.js',
                            './jquery-cookie/jquery.cookie.js',
                            './chemcalc/lib.js',
                            './jsgraph/dist/**',
                            './jqueryui-touch-punch/jquery.ui.touch-punch.min.js',
                            './jcampconverter/build/jcampconverter.js',
                            './jsbarcode/jsBarcode.min.js',
                            './slickgrid/**',
                            './ml/dist/*',
                            './alpaca/**',
                            './jquery-tmpl/**',
                            './setImmediate/setImmediate.js',
                            './chroma-js/chroma.min.js',
                            './sdf-parser/**',
                            './async/lib/async.js',
                            ['./jsNMR/lib/components/VisuMol/**', './jsNMR/src/**', './jsNMR/dist/**'],
                            './loglevel/dist/loglevel.min.js'
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
                    }
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

                files: [
                    {
                        expand: true,
                        cwd: usrPath + '/filters/',
                        src: '**',
                        filter: function (filePath) {
                            var files = grunt.option('filterFiles');
                            for (var i = 0, l = files.length; i < l; i++) {
                                if (path.relative(mapPath(files[ i ]), filePath) == '') {
                                    return true;
                                }
                            }

                            return false;
                        },
                        dest: './build/usr/filters/'
                    },

                    {
                        expand: true,
                        cwd: usrPath,
                        src: ['**', '!config/**', '!filters/**', '!modules/**'],
                        dest: './build/usr/'
                    }
                ]
            },

            buildModules: {
                // Modules defined in usr folder
                files: [
                    {
                        expand: true,
                        cwd: usrPath,
                        src: ['./modules/**'],
                        dest: './build/usr/',
                        filter: function (filepath) {
                            var modulesStack = grunt.option('modulesStack');
                            filepath = filepath.replace(/\\/g, '/');
                            for (var i in modulesStack) {
                                if (filepath.indexOf(i.substr(4)) > -1) {
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
                        filter: function (filepath) {
                            var modulesStack = grunt.option('modulesStack');
                            filepath = filepath.replace(/\\/g, '/');
                            for (var i in modulesStack) {
                                if (filepath.indexOf(i) > -1) {
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
                src: [ 'build/modules/**/.DS_Store' ]
            },

            modulesJson: {
                src: [ 'build/modules/**/*.json' ],
                filter: function (filepath) {
                    return ( !filepath.match('/lib/') && !filepath.match(/folder\.json$/) );
                }
            },

            modulesJsonErase: {
                src: [ 'src/modules/**/*.json' ],
                filter: function (filepath) {
                    return ( !filepath.match('/lib/') );
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
                    mainConfigFile: './build/init.js',
                    dir: './build2/',
                    appDir: './build/',
                    baseUrl: './',
                    optimizeCss: 'none',
                    optimize: 'none',
                    removeCombined: true,
                    modules: [
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
        },

        jsdoc: {
            build: {
                src: ['src/src/util/*'],
                options: {
                    destination: 'doc',
                    template : 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
                    configure : 'doc.conf.json'
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
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('upload', [ 'ftp' ]);

    grunt.registerTask('clean-images', 'Clean all images that are not used in the build', function () {
        var options
            , walker
            , whiteset = {}
            , allimages = [];

        // To be truly synchronous in the emitter and maintain a compatible api,
        // the listeners must be listed before the object is created
        options = {
            listeners: {
                file: function (root, fileStats, next) {
                    function findFormIcon(regexp) {
                        var m = regexp.exec(content);
                        while (m != null) {
                            var fn = 'build/lib/forms/images/' + m[1] + '.png';
                            if (fs.existsSync(fn)) {
                                whiteset[fn] = '';
                            }
                            m = iconreg.exec(content);
                        }
                    }

                    var expressions;

                    expressions = [/\.jpg$/, /\.png$/, /\.jpeg$/, /\.gif$/];
                    if (_.any(expressions, function (exp) {
                        return fileStats.name.match(exp);
                    })) {
                        allimages.push(root + '/' + fileStats.name);
                    }

                    expressions = [/\.css$/, /\.js$/, /\.html$/];
                    if (_.any(expressions, function (exp) {
                        return fileStats.name.match(exp);
                    })) {
                        // File content
                        var content = fs.readFileSync(root + '/' + fileStats.name).toString();

                        // Search for icons specified using the forms library
                        if (fileStats.name.match(/\.js$/)) {
                            var iconreg = /icon:\s*['"]([a-zA-Z_\-]+)['"]/g;
                            findFormIcon(iconreg);
                            iconreg = /setIcon\(['"]([a-zA-Z_\-]+)['"]/g;
                            findFormIcon(iconreg);
                        }

                        // Search for images specified in .js, .css and .html files
                        var reg = new RegExp('[/\\.a-zA-Z_\\- 0-9]+\\.(png|jpeg|jpg|gif)','gi');
                        var res = content.match(reg);
                        if (res) {
                            _.keys(res).forEach(function (i) {
                                if (res[i][0] !== '/') { // ignore absolute path
                                    var filepath = path.join(root, res[i]);
                                    if (fs.existsSync(filepath)) {
                                        whiteset[filepath] = '';
                                    }
                                }
                            });
                        }
                        next();
                    }
                }, errors: function (root, nodeStatsArray, next) {
                    console.log('An error occured in walk');
                    next();
                }
            }
        };

        walker = walk.walkSync('build', options);

        // Delete images that are not in the white set
        var delcount = 0;
        _.keys(allimages).forEach(function (i) {
            if (!_.has(whiteset, allimages[i])) {
                fs.unlinkSync(allimages[i]);
                delcount++;
            }
        });
        console.log('Deleted ' + delcount + ' out of ' + allimages.length + ' images.')
    });

    grunt.registerTask('manifest:generate', function () {
        var files = recursivelyLookupDirectory('build', true);
        fs.writeFileSync('build/cache.appcache', 'CACHE MANIFEST\n\nCACHE:\n\n');
        for (var i = 0; i < files.length; i++) {
            fs.appendFileSync('build/cache.appcache', files[i] + '\n');
        }
        fs.appendFileSync('build/cache.appcache', '\n\nNETWORK:\n*\n');

        enableManifest('build/index.html', 'cache.appcache');
    });

    function enableManifest(file, manifest) {
        var content = fs.readFileSync(file);
        content = content.toString().replace('<html>', '<html manifest="' + (manifest || 'cache.appcache') + '">');
        fs.writeFileSync(file, content);
    }

    function recursivelyLookupDirectory(path, asCwd) {
        var relPath;
        var cd = process.cwd();
        if (asCwd) {
            process.chdir(process.cwd() + '/' + path);
            relPath = '.';
        }
        else {
            relPath = path;
        }
        var files = [];
        // var stats = fs.lstatSync(relPath);
        var options = {
            listeners: {
                file: function (root, fileStats, next) {
                    // console.log(root, fileStats);
                    var p
                    if (root === '.') {
                        p = fileStats.name;
                    }
                    else if (root.substr(0, 2) === './') {
                        p = root.substr(2) + '/' + fileStats.name;
                    }
                    else {
                        p = root + '/' + fileStats.name;
                    }
                    files.push(p);
                    next();
                },
                errors: function (root, nodeStatsArray, next) {
                    console.log('An error occured in walk', root, nodeStatsArray);
                    next();
                }
            }
        };
        walker = walk.walkSync(relPath, options);
        process.chdir(cd);
        return files;
    }

    var buildTasks = [
        'clean:build',
        'buildProject',
        'copy:buildModules',
        'copy:buildUsr',
        'copy:build',
        'copy:buildLib',
        'requirejs',
        'uglify:build',
        'clean:build',
        'rename:afterBuild'
    ];

    if (grunt.option('clean-images')) {
        console.log('clean-images on');
        buildTasks.push('clean-images');
    }
    if (grunt.option('manifest')) {
        console.log('manifest on');
        buildTasks.push('manifest:generate');
    }
    grunt.registerTask('build', buildTasks);

    grunt.registerTask('buildProject', 'Build project', function () {


        if (!fs.existsSync('./build/')) {

            fs.mkdirSync('build/');
        }

        var modulesStack = {};
        grunt.option('modulesStack', modulesStack);

        var config = grunt.option('config') || './src/usr/config/default.json';

        if (!fs.existsSync(config)) {
            console.log('File config (' + config + ') does not exist');
            return;
        }


        var cfg = grunt.file.readJSON(config),
            file,
            modules = {},
            jsonStructure = {},
            modulesFinal = {};

        var usrDir = cfg.usrDir || 'usr';
        cfg.usrDir = 'usr';	// after the build, it will be in usr

        function oldLoadFile() {
            var fileName;
            if (typeof arguments[0] === 'object') {
                fileName = arguments[0];
            }
            else if (arguments.length === 1) {
                fileName = './src/' + arguments[0];
            }
            else {
                fileName = arguments[1] + arguments[0];
            }
            var file,
                j = 0,
                i = 0,
                l,
                jsonStructure = { modules: [], folders: {} };
//console.log( fileName );
            if (typeof fileName !== 'object') {

                if (!fs.existsSync(fileName)) {
                    if (arguments.length === 1) {
                        console.log('arguments[0]', arguments[0]);
                        // Not a very neat fix but whatever
                        var pos = arguments[0].search('usr');
                        if (pos > -1) {
                            console.log('new : ', arguments[0].substring(pos + 1));
                            arguments[0] = arguments[0].substring(pos + 1);
                        }
                        return oldLoadFile(arguments[0], usrPath + '/');
                    }
                    console.log('Folder file ' + fileName + ' does not exist');
                    return;
                }
                // console.log( 'Fetching file ' + fileName);
                file = grunt.file.readJSON(fileName);
            }
            else {
                file = fileName;
            }

            for (var k in file.folders) {
                if (arguments.length === 1) {
                    jsonStructure.folders[k] = oldLoadFile(file.folders[k] + 'folder.json')
                }
                else {
                    console.log('load file:', file.folders[k] + 'folder.json', arguments[1]);
                    jsonStructure.folders[k] = oldLoadFile(file.folders[k] + 'folder.json', arguments[1])
                }
                // jsonStructure.folders[ k ] = oldLoadFile( './src/' + file.folders[ k ] + 'folder.json');
            }

            if (file.modules) {
                for (j = 0, l = file.modules.length; j < l; j++) {
                    modules[ file.modules[ j ].url ] = true;
                    modulesStack[ file.modules[ j ].url ] = true;
                    if (arguments.length === 2) {
                        console.log('here...', file.modules[j].url);
                        file.modules[j].url = './usr/' + file.modules[j].url;
                    }
                    // console.log('module added: ', file.modules[j]);
                    jsonStructure.modules.push(file.modules[ j ]);
                }
            }

            return jsonStructure;
        }

        function getRealPath(path) {
            if (path.indexOf('usr') === 0) {
                path = usrDir + path.substr(3);
            }
            return './src/' + path;
        }

        function loadFile(fileName) {
            var file,
                j = 0,
                i = 0,
                l,
                jsonStructure = { modules: [], folders: {} };
            if (typeof fileName === 'string') {
                if (!fs.existsSync(fileName)) {
                    return console.log('Folder file ' + fileName + ' does not exist');
                }
                file = grunt.file.readJSON(fileName + '/folder.json');
            }
            else {
                file = fileName;
            }

            jsonStructure.name = file.name;
            if (file.folders && (file.folders instanceof Array)) {
                for (var i = 0; i < file.folders.length; i++) {
                    var res = loadFile(fileName + '/' + file.folders[i]);
                    jsonStructure.folders[res.name] = res;
                }
            }

            if (file.modules) {
                for (j = 0, l = file.modules.length; j < l; j++) {
                    modules[ file.modules[ j ].url ] = true;
                    modulesStack[ file.modules[ j ].url ] = true;
                    jsonStructure.modules.push(file.modules[ j ]);
                }
            }
            return jsonStructure;
        }

        if (cfg.modules) {
            if (cfg.modules instanceof Array) {  // Backwards compatibility
                for (var i = 0, l = cfg.modules.length; i < l; i++) {
                    console.log(typeof cfg.modules[ i ]);
                    console.log(cfg.modules[ i ]);
                    if (typeof cfg.modules[ i ] == 'object') {
                        extend(true, modulesFinal, oldLoadFile(cfg.modules[ i ]));
                    } else {
                        extend(true, modulesFinal, oldLoadFile(cfg.modules[ i ]));
                        //        console.log( oldLoadFile( './src/' + cfg.modules[ i ] ) );
                        //       console.log( "___" );
                    }
                }
            } else if (cfg.modules.folders instanceof Array) {
                var list = cfg.modules;
                if (list.modules) {
                    modulesFinal.modules = [];
                    for (j = 0, l = list.modules.length; j < l; j++) {
                        modules[ list.modules[ j ].url ] = true;
                        modulesStack[ list.modules[ j ].url ] = true;
                        modulesFinal.modules.push(list.modules[ j ]);
                    }
                }
                modulesFinal.folders = {};
                for (var i = 0; i < list.folders.length; i++) {
                    extend(true, modulesFinal, loadFile(getRealPath(list.folders[i])));
                }
            }
            else {
                modulesFinal = loadFile(cfg.modules);
            }
        }

        /* Find filter files from the config.json and puts them in an option */
        var filterFiles = [];
        for (var i in cfg.filters) {
            filterFiles.push(cfg.filters[i].file);
        }
        grunt.option('filterFiles', filterFiles);

        //modulesFinal = modules;
        cfg.modules = modulesFinal;

        //fs.writeFileSync( './build/modules.json', JSON.stringify( jsonStructure, false, '\t' ) );
        //cfg.modules = jsonStructure;//'./modules.json';

        mkpath.sync('./build/modules/types/');
        fs.writeFileSync('./build/modules/types/folder.json', JSON.stringify(cfg.modules));

        mkpath.sync('./build/usr/config/');
        fs.writeFileSync('./build/usr/config/default.json', JSON.stringify(cfg, false, '\t'));
        //grunt.task.run('clean:buildTemp');
    });

    // Takes care of module jsons
    grunt.registerTask('eraseModuleJsons', [ 'clean:modulesJsonErase' ]);
    grunt.registerTask('createJSONModules', 'Create all modules json', function () {
        function recurseFolder(basePath, relPath) {

            var folders = fs.readdirSync(basePath),
                allFolders = [],
                allModules = [],
                containsModule = false,
                target = {},
                subFolder;

            for (var i = 0, l = folders.length; i < l; i++) {
                if (!fs.statSync(basePath + '/' + folders[ i ]).isDirectory() || folders[ i ] == 'lib') {
                    continue;
                }

                if (fs.existsSync(basePath + '/' + folders[ i ] + '/model.js')) {
                    allModules.push(folders[ i ]);
                } else {
                    allFolders.push(folders[ i ]);
                }

                containsModule = containsModule || fs.existsSync(basePath + '/' + folders[ i ] + '/model.js');
            }

            if (allFolders.length == 0 && allModules.length == 0) {
                return;
            }

            target.modules = [];
            for (var i = 0, l = allModules.length; i < l; i++) {
                var moduleInfo = /moduleInformation[^\{]+(\{[^}]+})/.exec(grunt.file.read(basePath + '/' + allModules[ i ] + '/controller.js'));

                try {
                    eval ('moduleInfo = ' + moduleInfo[1]);
                } catch (e) {
                    throw new Error('Could not find module information for ' + basePath+'/'+allModules[i]);
                }

                var info = {
                    moduleName: (moduleInfo.name || allModules[ i ]),
                    url: ( relPath ) + '/' + allModules[ i ] + '/'
                };

                if (moduleInfo.hidden) {
                    info.hidden = true;
                }

                target.modules.push(info);
            }

            target.folders = [];
            for (var i = 0, l = allFolders.length; i < l; i++) {
                recurseFolder(basePath + '/' + allFolders[ i ], relPath + '/' + allFolders[ i ]);

                if (fs.existsSync(basePath + '/' + allFolders[ i ] + '/folder.json')) {
                    subFolder = grunt.file.readJSON(basePath + '/' + allFolders[ i ] + '/folder.json');
                    target.folders.push(allFolders[i]);
                }
            }

            if (fs.existsSync(basePath + '/folder.json')) {
                var json = grunt.file.readJSON(basePath + '/folder.json');
                json.folders = target.folders;
                json.modules = target.modules;

                target = json;

            } else {
                target.name = basePath.split('/').pop();
            }

            fs.writeFileSync(basePath + '/folder.json', JSON.stringify(target, null, 2));
        }

        recurseFolder('./src/modules/types', 'modules/types');
        recurseFolder('./src/usr/modules', 'usr/modules');
    });

};
