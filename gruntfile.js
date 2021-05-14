/* eslint-env node*/
'use strict';

module.exports = function(grunt) {
  var walk = require('walk');
  var fs = require('fs');
  var _ = require('lodash');
  var mkpath = require('mkpath');
  var path = require('path');
  var extend = require('extend');
  var child_process = require('child_process');
  var semver = require('semver');
  var changelog = require('conventional-changelog');
  var tempfile = require('tempfile');
  var addStream = require('add-stream');

  var usrPath = grunt.option('usr') || './src/usr';

  function mapPath(path) {
    // Map a relative application path to a relative build path
    var mapped;
    if (path.indexOf('usr/') === 0) mapped = usrPath + path.substr(3);
    else mapped = `./src/${path}`;
    if (mapped.indexOf('.js') === -1) mapped += '.js';
    return mapped;
  }

  // Project configuration.
  grunt.initConfig({
    browserify: {
      countries: {
        files: {
          'src/browserified/country-data/index.js': [
            './node_modules/country-data/index.js',
          ],
        },
        options: {
          browserifyOptions: {
            standalone: 'CountryData',
          },
        },
      },
      delay: {
        files: {
          'src/browserified/delay/index.js': ['./node_modules/delay/index.js'],
        },
        options: {
          browserifyOptions: {
            standalone: 'Delay',
          },
        },
      },
      mimeTypes: {
        files: {
          'src/browserified/mime-types/index.js': [
            './node_modules/mime-types/index.js',
          ],
        },
        options: {
          browserifyOptions: {
            standalone: 'mimeTypes',
          },
        },
      },
      superagent: {
        files: {
          'src/browserified/superagent/index.js': [
            './node_modules/superagent/lib/client.js',
          ],
        },
        options: {
          browserifyOptions: {
            standalone: 'superagent',
          },
        },
      },
      twig: {
        files: {
          'src/browserified/twig/twig.js': ['./node_modules/twig/twig.min.js'],
        },
        options: {
          browserifyOptions: {
            standalone: 'Twig',
          },
        },
      },
      bioParsers: {
        files: {
          'src/browserified/bioParsers/index.js': [
            './node_modules/bio-parsers/parsers/index.js',
          ],
        },
        options: {
          browserifyOptions: {
            standalone: 'bioParsers',
          },
        },
      },
      RxnRenderer: {
        files: {
          'src/browserified/RxnRenderer/index.js': [
            './node_modules/rxn-renderer/lib/index.js',
          ],
        },
        options: {
          browserifyOptions: {
            standalone: 'RxnRenderer',
          },
        },
      },
      MFParser: {
        files: {
          'src/browserified/MFParser/index.js': [
            './node_modules/mf-parser/src/index.js',
          ],
        },
        options: {
          browserifyOptions: {
            standalone: 'MFParser',
          },
        },
      },
    },
    pkg: grunt.file.readJSON('package.json'),
    babel: {
      transpile: {
        options: {
          plugins: [`${__dirname}/strict-plugin.js`],
          presets: [
            [
              '@babel/env',
              {
                targets: {
                  browsers: [
                    'chrome >= 65',
                    'firefox >= 60',
                    'last 2 safari versions',
                    'last 2 edge versions',
                  ],
                },
              },
            ],
          ],
        },
        files: [
          {
            expand: true, // Enable dynamic expansion.
            cwd: './build/', // Src matches are relative to this path.
            src: [
              'init.js',
              'version.js',
              'components/jsgraph/dist/jsgraph-es6.js',
              'modules/**/*.js',
              '!modules/**/lib/**/*.js',
              'src/**/*.js',
              '!lib/**/*',
              'lib/forms/**/*.js',
              'lib/chemistry/*.js',
              'lib/twigjs/*.js',
            ], // Actual pattern(s) to match.
            dest: './build/', // Destination path prefix.
            // overwrite: true,
            ext: '.js', // Dest filepaths will have this extension.
          },
        ],
      },
      minify: {
        options: {
          // sourceMap: false, // takes too much resources
          comments: false,
          presets: [
            [
              'minify',
              {
                builtIns: false, // https://github.com/babel/minify/issues/904
                evaluate: false, // https://github.com/babel/minify/issues/936
              },
            ],
          ],
        },
        files: [
          {
            expand: true, // Enable dynamic expansion.
            cwd: './build2/', // Src matches are relative to this path.
            src: [
              'init.js',
              // 'components/jsgraph/dist/jsgraph-es6.js',
              'modules/**/*.js',
              '!modules/**/lib/**/*.js',
              'src/**/*.js',
              '!lib/**/*',
              'lib/forms/**/*.js',
              'lib/twigjs/*.js',
              'lib/chemistry/*.js',
              'lib/loadingplot/*.js',
            ], // Actual pattern(s) to match.
            dest: './build2/', // Destination path prefix.
            // overwrite: true,
            ext: '.js', // Dest filepaths will have this extension.
          },
        ],
      },
    },
    copy: {
      buildLib: {
        files: [
          {
            expand: true,
            cwd: './src/components/',
            src: [
              './d3/d3*',
              [
                './fancytree/dist/jquery.fancytree*.js',
                './fancytree/dist/skin-lion/*',
              ],
              [
                './jqgrid_edit/js/*.js',
                './jqgrid_edit/js/i18n/grid.locale-en.js',
                './jqgrid_edit/css/*.css',
              ],
              './jquery/dist/*',
              [
                './jquery-ui/ui/*.js',
                './jquery-ui/ui/effects/*.js',
                './jquery-ui/ui/widgets/*.js',
                './jquery-ui/themes/base/**',
              ],
              './threejs/build/three.min.js',
              './ace/src/**',
              [
                './ckeditor/skins/**',
                './ckeditor/ckeditor.js',
                './ckeditor/styles.js',
                './ckeditor/contents.css',
                './ckeditor/adapters/jquery.js',
                './ckeditor/lang/en.js',
                './ckeditor/plugins/**',
                './ckeditor/config.js',
              ],
              './farbtastic/src/farbtastic.js',
              './jquery.threedubmedia/event.drag/jquery.event.drag.js',
              './sprintf/dist/**',
              './requirejs/require.js',
              './x2js/xml2json*',
              [
                './leaflet/dist/**',
                './leaflet-omnivore/leaflet-omnivore.min.js',
              ],
              './jsoneditor/dist/**',
              './jit/Jit/**/*',
              './ui-contextmenu/jquery.ui-contextmenu*',
              './papa-parse/papaparse*',
              './colors/css/colors.min.css',
              './pouchdb/dist/**',
              './uri.js/src/*.js',
              './onde/src/*',
              ['./spectrum/spectrum.js', './spectrum/spectrum.css'],
              './superagent/superagent.js',
              './modernizr/modernizr.js',
              './lodash/dist/**',
              './bowser/bowser*',
              './jquery-cookie/jquery.cookie.js',
              './chemcalc/lib.js',
              './jsgraph/dist/**',
              './jsme/**',
              './jsmol/**',
              './jcampconverter/dist/*',
              './jsbarcode/dist/*.js',
              './slickgrid/**',
              './ml/dist/*',
              './jquery-tmpl/**',
              './setImmediate/setImmediate.js',
              './chroma-js/chroma*',
              './async/dist/**',
              './loglevel/dist/**',
              './marked/lib/marked.js',
              './highlight.js/build/highlight.pack.js',
              './jquery.panzoom/dist/*.js',
              './jquery-mousewheel/*.js',
              './select2/dist/**',
              './jszip/dist/**',
              './file-saver.js/*.js',
              './json-chart/dist/*',
              './d3-plugins/**',
              './mime-types/**',
              './bluebird/js/browser/**',
              './notifyjs/dist/**',
              './web-animations-js/*.js',
              './web-animations-js/*.js.map',
              './moment/moment*',
              './moment-duration-format/lib/moment-duration-format.js',
              './smart-array-filter/dist/*',
              './numeral/numeral*',
              './flag-icon-css/css/flag-icon.min.css',
              './flag-icon-css/flags/**',
              './jquery-qrcode/jquery.qrcode.min.js',
              './mathjs/dist/**',
              './nmr-simulation/**',
              './katex/dist/**',
              './babel-standalone/**',
              './fetch/fetch.js',
              './js-yaml/dist/**',
              './canvg/dist/**',
              './eventEmitter/*.js',
              ['./quill/*.min.js*', './quill/*.css'],
            ],
            dest: './build/components/',
          },
          {
            expand: true,
            cwd: './node_modules',
            src: [
              './katex/dist/**',
              './angularplasmid/dist/**',
              './quill-image-drop-module/image-drop.min.js',
              './quill-image-resize-module/image-resize.min.js',
              './mathjs/dist/math.min.js',
              './mathjs/dist/math.min.map',
              './openchemlib/dist/**',
              './d3-hierarchy/dist/d3-hierarchy.min.js',
              './@fortawesome/fontawesome-free/css/all.min.css',
              './@fortawesome/fontawesome-free/webfonts/*',
            ],
            dest: './build/node_modules/',
          },
          {
            expand: true,
            cwd: './src/browserified',
            src: ['**'],
            dest: './build/browserified',
          },
        ],
      },

      build: {
        files: [
          {
            expand: true,
            cwd: './src/',
            src: [
              './index.html',
              'init.js',
              'version.js',
              'css/**',
              'bin/**',
              'lib/**',
              'src/**',
              'data/**',
            ],
            dest: './build/',
          },
        ],
      },

      buildUsr: {
        files: [
          {
            expand: true,
            cwd: `${usrPath}/filters/`,
            src: '**',
            filter: function(filePath) {
              var files = grunt.option('filterFiles');
              for (var i = 0, l = files.length; i < l; i++) {
                if (path.relative(mapPath(files[i]), filePath) == '') {
                  return true;
                }
              }

              return false;
            },
            dest: './build/usr/filters/',
          },

          {
            expand: true,
            cwd: usrPath,
            src: ['**', '!config/**', '!filters/**', '!modules/**'],
            dest: './build/usr/',
          },
        ],
      },

      buildModules: {
        // Modules defined in usr folder
        files: [
          {
            expand: true,
            cwd: usrPath,
            src: ['./modules/**'],
            dest: './build/usr/',
            filter: function(filepath) {
              var modulesStack = grunt.option('modulesStack');
              filepath = filepath.replace(/\\/g, '/');
              for (var i in modulesStack) {
                if (filepath.indexOf(i.substr(4)) > -1) {
                  return true;
                }
              }
              return false;
            },
          },
          {
            expand: true,
            cwd: './src/',
            src: ['./modules/**'],
            dest: './build/',
            filter: function(filepath) {
              var modulesStack = grunt.option('modulesStack');
              filepath = filepath.replace(/\\/g, '/');
              for (var i in modulesStack) {
                if (filepath.indexOf(i) > -1) {
                  return true;
                }
              }
              return false;
            },
          },
          {
            expand: true,
            cwd: './src/',
            src: [
              './modules/module.js',
              './modules/modulefactory.js',
              './default/**',
              './modules/default/**',
            ],
            dest: './build/',
          },
        ],
      },
    },

    clean: {
      build: {
        src: ['build'],
      },

      buildTemp: {
        src: ['build2'],
      },

      modules: {
        src: ['build/modules/**/.DS_Store'],
      },

      modulesJson: {
        src: ['build/modules/**/*.json'],
        filter: function(filepath) {
          return !filepath.match('/lib/') && !filepath.match(/folder\.json$/);
        },
      },

      modulesJsonErase: {
        src: ['src/modules/**/*.json'],
        filter: function(filepath) {
          return !filepath.match('/lib/');
        },
      },
    },

    rename: {
      afterBuild: {
        src: 'build2',
        dest: 'build',
      },
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
          useStrict: true,
          modules: [
            {
              name: 'init',
              exclude: ['babel', 'lodash'],
            },
          ],
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-rename');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('manifest:generate', function() {
    var files = recursivelyLookupDirectory('build', true);
    fs.writeFileSync('build/cache.appcache', 'CACHE MANIFEST\n\nCACHE:\n\n');
    for (var i = 0; i < files.length; i++) {
      fs.appendFileSync('build/cache.appcache', `${files[i]}\n`);
    }
    fs.appendFileSync('build/cache.appcache', '\n\nNETWORK:\n*\n');

    enableManifest('build/index.html', 'cache.appcache');
  });

  function enableManifest(file, manifest) {
    var content = fs.readFileSync(file);
    content = content
      .toString()
      .replace('<html>', `<html manifest="${manifest || 'cache.appcache'}">`);
    fs.writeFileSync(file, content);
  }

  function recursivelyLookupDirectory(path, asCwd) {
    var relPath;
    var cd = process.cwd();
    if (asCwd) {
      process.chdir(`${process.cwd()}/${path}`);
      relPath = '.';
    } else {
      relPath = path;
    }
    var files = [];
    // var stats = fs.lstatSync(relPath);
    var options = {
      listeners: {
        file: function(root, fileStats, next) {
          // console.log(root, fileStats);
          var p;
          if (root === '.') {
            p = fileStats.name;
          } else if (root.substr(0, 2) === './') {
            p = `${root.substr(2)}/${fileStats.name}`;
          } else {
            p = `${root}/${fileStats.name}`;
          }
          files.push(p);
          next();
        },
        errors: function(root, nodeStatsArray, next) {
          console.log('An error occured in walk', root, nodeStatsArray);
          next();
        },
      },
    };
    walk.walkSync(relPath, options);
    process.chdir(cd);
    return files;
  }

  var buildTasks = [
    'buildTime:set',
    'clean:build',
    'buildProject',
    'copy:buildModules',
    'copy:buildUsr',
    'copy:build',
    'copy:buildLib',
    'css:modules',
    'babel:transpile',
    'requirejs',
    'babel:minify',
    'clean:build',
    'rename:afterBuild',
    'buildTime:unset',
  ];

  if (grunt.option('manifest')) {
    console.log('manifest on');
    buildTasks.push('manifest:generate');
  }
  grunt.registerTask('build', buildTasks);

  grunt.registerTask('buildProject', 'Build project', function() {
    if (!fs.existsSync('./build/')) {
      fs.mkdirSync('build/');
    }

    var modulesStack = {};
    grunt.option('modulesStack', modulesStack);

    var config = grunt.option('config') || './src/usr/config/default.json';

    if (!fs.existsSync(config)) {
      console.log(`File config (${config}) does not exist`);
      return;
    }

    var cfg = grunt.file.readJSON(config),
      file,
      modules = {},
      jsonStructure = {},
      modulesFinal = {};

    var usrDir = cfg.usrDir || 'usr';
    cfg.usrDir = 'usr'; // after the build, it will be in usr

    function oldLoadFile() {
      var fileName;
      if (typeof arguments[0] === 'object') {
        fileName = arguments[0];
      } else if (arguments.length === 1) {
        fileName = `./src/${arguments[0]}`;
      } else {
        fileName = arguments[1] + arguments[0];
      }
      var file,
        j = 0,
        i = 0,
        l,
        jsonStructure = { modules: [], folders: {} };
      // console.log( fileName );
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
            return oldLoadFile(arguments[0], `${usrPath}/`);
          }
          console.log(`Folder file ${fileName} does not exist`);
          return;
        }
        // console.log( 'Fetching file ' + fileName);
        file = grunt.file.readJSON(fileName);
      } else {
        file = fileName;
      }

      for (var k in file.folders) {
        if (arguments.length === 1) {
          jsonStructure.folders[k] = oldLoadFile(
            `${file.folders[k]}folder.json`,
          );
        } else {
          console.log(
            'load file:',
            `${file.folders[k]}folder.json`,
            arguments[1],
          );
          jsonStructure.folders[k] = oldLoadFile(
            `${file.folders[k]}folder.json`,
            arguments[1],
          );
        }
        // jsonStructure.folders[ k ] = oldLoadFile( './src/' + file.folders[ k ] + 'folder.json');
      }

      if (file.modules) {
        for (j = 0, l = file.modules.length; j < l; j++) {
          modules[file.modules[j].url] = true;
          modulesStack[file.modules[j].url] = true;
          if (arguments.length === 2) {
            file.modules[j].url = `./usr/${file.modules[j].url}`;
          }
          jsonStructure.modules.push(file.modules[j]);
        }
      }

      return jsonStructure;
    }

    function getRealPath(path) {
      if (path.indexOf('usr') === 0) {
        path = usrDir + path.substr(3);
      }
      return `./src/${path}`;
    }

    function loadFile(fileName) {
      var file;
      var j = 0;
      var i = 0;
      var l;
      var jsonStructure = { modules: [], folders: {} };
      if (typeof fileName === 'string') {
        if (!fs.existsSync(fileName)) {
          return console.log(`Folder file ${fileName} does not exist`);
        }
        file = grunt.file.readJSON(`${fileName}/folder.json`);
      } else {
        file = fileName;
      }

      jsonStructure.name = file.name;
      if (file.folders && file.folders instanceof Array) {
        for (var i = 0; i < file.folders.length; i++) {
          var res = loadFile(`${fileName}/${file.folders[i]}`);
          jsonStructure.folders[res.name] = res;
        }
      }

      if (file.modules) {
        for (j = 0, l = file.modules.length; j < l; j++) {
          modules[file.modules[j].url] = true;
          modulesStack[file.modules[j].url] = true;
          jsonStructure.modules.push(file.modules[j]);
        }
      }
      return jsonStructure;
    }

    if (cfg.modules) {
      if (cfg.modules instanceof Array) {
        // Backwards compatibility
        for (var i = 0, l = cfg.modules.length; i < l; i++) {
          if (typeof cfg.modules[i] == 'object') {
            extend(true, modulesFinal, oldLoadFile(cfg.modules[i]));
          } else {
            extend(true, modulesFinal, oldLoadFile(cfg.modules[i]));
            //        console.log( oldLoadFile( './src/' + cfg.modules[ i ] ) );
            //       console.log( "___" );
          }
        }
      } else if (cfg.modules.folders instanceof Array) {
        var list = cfg.modules;
        if (list.modules) {
          modulesFinal.modules = [];
          for (var j = 0, l = list.modules.length; j < l; j++) {
            modules[list.modules[j].url] = true;
            modulesStack[list.modules[j].url] = true;
            modulesFinal.modules.push(list.modules[j]);
          }
        }
        modulesFinal.folders = {};
        for (var i = 0; i < list.folders.length; i++) {
          extend(true, modulesFinal, loadFile(getRealPath(list.folders[i])));
        }
      } else {
        modulesFinal = loadFile(cfg.modules);
      }
    }

    /* Find filter files from the config.json and puts them in an option */
    var filterFiles = [];
    for (var i in cfg.filters) {
      filterFiles.push(cfg.filters[i].file);
    }
    grunt.option('filterFiles', filterFiles);

    // modulesFinal = modules;
    cfg.modules = modulesFinal;

    // fs.writeFileSync( './build/modules.json', JSON.stringify( jsonStructure, false, '\t' ) );
    // cfg.modules = jsonStructure;//'./modules.json';

    mkpath.sync('./build/modules/types/');
    fs.writeFileSync(
      './build/modules/types/folder.json',
      JSON.stringify(cfg.modules),
    );

    mkpath.sync('./build/usr/config/');
    fs.writeFileSync(
      './build/usr/config/default.json',
      JSON.stringify(cfg, false, '\t'),
    );
    // grunt.task.run('clean:buildTemp');
  });

  // Takes care of module jsons
  grunt.registerTask('eraseModuleJsons', ['clean:modulesJsonErase']);
  grunt.registerTask(
    'createJSONModules',
    'Create all modules json',
    function() {
      recurseFolder('./src/modules/types', 'modules/types');
      recurseFolder('./src/usr/modules', 'usr/modules');
    },
  );

  grunt.registerTask('recurseFolder', 'Recurse Folder', function() {
    var from = grunt.option('recurseFolderFrom');
    var to = grunt.option('recurseFolderTo');

    if (from && to) {
      recurseFolder(from, to);
    }
  });

  function recurseFolder(basePath, relPath) {
    var folders = fs.readdirSync(basePath),
      allFolders = [],
      allModules = [],
      containsModule = false,
      target = {},
      subFolder;

    for (var i = 0, l = folders.length; i < l; i++) {
      if (
        !fs.statSync(`${basePath}/${folders[i]}`).isDirectory() ||
        folders[i] == 'lib'
      ) {
        continue;
      }

      if (fs.existsSync(`${basePath}/${folders[i]}/model.js`)) {
        allModules.push(folders[i]);
      } else {
        allFolders.push(folders[i]);
      }

      containsModule =
        containsModule || fs.existsSync(`${basePath}/${folders[i]}/model.js`);
    }

    if (allFolders.length == 0 && allModules.length == 0) {
      return;
    }

    target.modules = [];
    for (var i = 0, l = allModules.length; i < l; i++) {
      var moduleInfo = /moduleInformation[^{]+(\{[^}]+})/.exec(
        grunt.file.read(`${basePath}/${allModules[i]}/controller.js`),
      );

      try {
        eval(`moduleInfo = ${moduleInfo[1]}`);
      } catch (e) {
        throw new Error(
          `Could not find module information for ${basePath}/${allModules[i]}`,
        );
      }

      var info = {
        moduleName: moduleInfo.name || allModules[i],
        url: `${relPath}/${allModules[i]}/`,
      };

      if (moduleInfo.hidden) {
        info.hidden = true;
      }

      target.modules.push(info);
    }

    target.folders = [];
    for (var i = 0, l = allFolders.length; i < l; i++) {
      recurseFolder(
        `${basePath}/${allFolders[i]}`,
        `${relPath}/${allFolders[i]}`,
      );

      if (fs.existsSync(`${basePath}/${allFolders[i]}/folder.json`)) {
        subFolder = grunt.file.readJSON(
          `${basePath}/${allFolders[i]}/folder.json`,
        );
        target.folders.push(allFolders[i]);
      }
    }

    if (fs.existsSync(`${basePath}/folder.json`)) {
      var json = grunt.file.readJSON(`${basePath}/folder.json`);
      json.folders = target.folders;
      json.modules = target.modules;

      target = json;
    } else {
      target.name = basePath.split('/').pop();
    }

    target.modules.sort(function(module1, module2) {
      return module1.moduleName
        .toLowerCase()
        .localeCompare(module2.moduleName.toLowerCase());
    });

    fs.writeFileSync(
      `${basePath}/folder.json`,
      JSON.stringify(target, null, 2),
    );
  }

  grunt.registerTask('bump', function(version) {
    var done = this.async();

    var versionJS = fs.readFileSync('./src/version.js', 'utf8');

    var major = getVersionValue(versionJS, 'MAJOR');
    var minor = getVersionValue(versionJS, 'MINOR');
    var patch = getVersionValue(versionJS, 'PATCH');
    var prerelease = getVersionValue(versionJS, 'PRERELEASE');

    var v = `${major}.${minor}.${patch}`;
    if (prerelease !== 'false') {
      v += `-${prerelease}`;
    }

    var semVersion = semver.parse(v);

    console.log(`Current version is ${semVersion}`);

    semVersion.inc(version || 'patch');

    console.log(`Bumping to ${semVersion}`);

    versionJS = setVersionValue(versionJS, 'MAJOR', semVersion.major);
    versionJS = setVersionValue(versionJS, 'MINOR', semVersion.minor);
    versionJS = setVersionValue(versionJS, 'PATCH', semVersion.patch);
    versionJS = setVersionValue(
      versionJS,
      'PRERELEASE',
      semVersion.prerelease.length ? semVersion.prerelease[0] : 'false',
    );

    if (grunt.option('release')) {
      // Set IS_RELEASE flag to true
      versionJS = setVersionValue(versionJS, 'IS_RELEASE', 'true');
      fs.writeFileSync('./src/version.js', versionJS);

      // Bump version in package.json
      var pkg = fs.readFileSync('./package.json', 'utf8');
      pkg = pkg.replace(/"version": ".+",/, `"version": "${semVersion}",`);
      fs.writeFileSync('./package.json', pkg);

      // Bump version in bower.json
      var bower = fs.readFileSync('./bower.json', 'utf8');
      bower = bower.replace(/"version": ".+",/, `"version": "${semVersion}",`);
      fs.writeFileSync('./bower.json', bower);

      console.log('Writing changelog');
      var changelogStream = changelog({
        preset: 'angular',
      });
      var tmp = tempfile();

      changelogStream
        .pipe(addStream(fs.createReadStream('History.md')))
        .pipe(fs.createWriteStream(tmp))
        .on('finish', function() {
          fs.createReadStream(tmp)
            .pipe(fs.createWriteStream('History.md'))
            .on('finish', publish);
        });
    } else {
      fs.writeFileSync('./src/version.js', versionJS);
      done();
    }

    function publish() {
      console.log('Publishing release');

      // Commit the version change and tag
      child_process.execFileSync('git', ['pull']);
      child_process.execFileSync('git', [
        'add',
        'src/version.js',
        'bower.json',
        'package.json',
        'History.md',
      ]);
      child_process.execFileSync('git', [
        'commit',
        '-m',
        `Release v${semVersion}`,
      ]);
      child_process.execFileSync('git', [
        'tag',
        '-a',
        `v${semVersion}`,
        '-m',
        `Release v${semVersion}`,
      ]);

      // Bump version to prepatch and reset IS_RELEASE to false
      versionJS = setVersionValue(versionJS, 'IS_RELEASE', 'false');
      semVersion.inc('prerelease');
      versionJS = setVersionValue(versionJS, 'PATCH', semVersion.patch);
      versionJS = setVersionValue(
        versionJS,
        'PRERELEASE',
        semVersion.prerelease.length ? semVersion.prerelease[0] : 'false',
      );

      fs.writeFileSync('./src/version.js', versionJS);

      console.log(`Now working on v${semVersion}`);

      // Commit the new version.js
      child_process.execFileSync('git', ['add', 'src/version.js']);
      child_process.execFileSync('git', [
        'commit',
        '-m',
        `Working on v${semVersion}`,
      ]);

      // Push commits and tag
      child_process.execFileSync('git', [
        'push',
        'origin',
        'master',
        '--follow-tags',
      ]);

      done();
    }
  });

  grunt.registerTask('buildTime', function(setting) {
    var versionJS = fs.readFileSync('./src/version.js', 'utf8');
    if (setting === 'set') {
      versionJS = setVersionValue(versionJS, 'BUILD_TIME', Date.now());
    } else {
      versionJS = setVersionValue(versionJS, 'BUILD_TIME', 'null');
    }
    fs.writeFileSync('./src/version.js', versionJS);
  });

  function getVersionValue(str, name) {
    const reg = new RegExp(`const ${name} = (.+?);\n`);
    return reg.exec(str)[1];
  }

  function setVersionValue(str, name, value) {
    const reg = new RegExp(`const ${name} = .+?;\n`);
    return str.replace(reg, `const ${name} = ${value};\n`);
  }

  grunt.registerTask('css:modules', function() {
    var folderJson = JSON.parse(
      fs.readFileSync('./build/modules/types/folder.json'),
    );
    var mIds = applyModules(folderJson, moduleProcessCss).filter(function(v) {
      return v !== undefined;
    });
    var versionJS = fs.readFileSync('./build/version.js', 'utf8');
    var newVersionJS = setVersionValue(
      versionJS,
      'INCLUDED_MODULE_CSS',
      JSON.stringify(mIds),
    );
    fs.writeFileSync('./build/version.js', newVersionJS);
  });

  function applyModules(folderJson, callback) {
    var res = [];
    if (Array.isArray(folderJson)) {
      for (var i = 0; i < folderJson.length; i++) {
        var el = folderJson[i];
        res = res.concat(applyModules(el, callback));
      }
    } else if (typeof folderJson === 'object') {
      for (var key in folderJson) {
        if (key === 'modules' && Array.isArray(folderJson[key])) {
          for (var i = 0; i < folderJson[key].length; i++) {
            var obj = folderJson[key][i];
            res.push(callback(obj));
          }
        } else {
          res = res.concat(applyModules(folderJson[key], callback));
        }
      }
    }
    return res;
  }

  function moduleProcessCss(module) {
    var p = path.join('./build/', module.url, 'style.css');
    if (module.url && fs.existsSync(p)) {
      append(p, './build/css/main.css');
      return moduleIdFromUrl(module.url);
    }
    return undefined;
  }

  function moduleIdFromUrl(url) {
    var reg = /([^/]+)(\/)?$/;
    var res = url.match(reg);
    return res[1];
  }

  function append(src, dest) {
    fs.appendFileSync(dest, `\n${fs.readFileSync(src)}`);
  }
};
