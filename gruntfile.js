'use strict';

module.exports = function (grunt) {
  const walk = require('walk');
  const fs = require('node:fs');
  const mkpath = require('mkpath');
  const path = require('node:path');
  const extend = require('extend');
  const child_process = require('node:child_process');
  const semver = require('semver');
  const changelog = require('conventional-changelog').default;
  const tempfile = require('tempfile');
  const addStream = require('add-stream');

  const usrPath = grunt.option('usr') || './src/usr';

  grunt.registerMultiTask('rename', 'Move and/or rename files.', function () {
    /*
     * grunt-rename
     * https://github.com/jdavis/grunt-rename
     *
     * Copyright (c) 2013 Josh Davis
     * Licensed under the MIT license.
     */
    const done = this.async();
    const options = this.options({
      ignore: false,
    });

    if (this.files.length === 0) {
      grunt.log.writeln(`Moved ${'0'.cyan} files.`);
      return done();
    }

    for (const f of this.files) {
      let dest = f.dest;
      let dir = path.dirname(dest);

      // Check if no source files were found
      if (f.src.length === 0) {
        // Continue if ignore is set
        if (options.ignore) {
          done();
          continue;
        } else {
          grunt.fail.warn(`Could not move file to ${f.dest} it did not exist.`);
          done();
          continue;
        }
      }

      f.src.filter(function (file) {
        // Resolve some conflicts because path doesn't work as I would
        // expect
        if (dest.lastIndexOf(path.sep) === dest.length - 1) {
          dir = dest;
          dest = path.join(dir, path.basename(file));
        }

        grunt.file.mkdir(dir);

        // First try builtin rename ability
        fs.rename(file, dest, function (err) {
          // Easy peasy
          if (!err) {
            grunt.verbose.writeln(`Moved ${file} to ${dest}`);
            return done();
          }

          // Now fallback to copying/unlinking
          var read = fs.createReadStream(file);
          var write = fs.createWriteStream(dest);

          read.on('error', function () {
            grunt.fail.warn(`Failed to read ${file}`);
            return done();
          });

          write.on('error', function () {
            grunt.fail.warn(`Failed to write to ${dest}`);
            return done();
          });

          write.on('close', function () {
            // Now remove the original file
            grunt.file.delete(file);

            grunt.verbose.writeln(`Moved ${file} to ${dest}`);
            return done();
          });

          read.pipe(write);
        });
      });
    }
  });

  function mapPath(path) {
    // Map a relative application path to a relative build path
    var mapped;
    if (path.indexOf('usr/') === 0) mapped = usrPath + path.slice(3);
    else mapped = `./src/${path}`;
    if (!mapped.includes('.js')) mapped += '.js';
    return mapped;
  }

  // Project configuration.
  grunt.initConfig({
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
              './requirejs/require.js',
              './d3/d3*',
              [
                './jqgrid_edit/js/*.js',
                './jqgrid_edit/js/i18n/grid.locale-en.js',
                './jqgrid_edit/css/*.css',
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
              './sprintf/dist/**',
              './x2js/xml2json*',
              './jit/Jit/**/*',
              './colors/css/colors.min.css',
              './uri.js/src/*.js',
              './onde/src/*',
              ['./spectrum/spectrum.js', './spectrum/spectrum.css'],
              './lodash/dist/**',
              './chemcalc/lib.js',
              './jsgraph/dist/**',
              './jsme/**',
              './jsmol/**',
              './jcampconverter/*',
              './slickgrid/**',
              './ml/dist/*',
              './jquery-tmpl/**',
              './setImmediate/setImmediate.js',
              './chroma-js/chroma*',
              './loglevel/dist/**',
              './highlight.js/build/highlight.pack.js',
              './jquery.panzoom/dist/*.js',
              './select2/dist/**',
              './jszip/dist/**',
              './file-saver.js/*.js',
              './notifyjs/dist/**',
              './web-animations-js/*.js',
              './web-animations-js/*.js.map',
              './flag-icon-css/css/flag-icon.min.css',
              './flag-icon-css/flags/**',
              './jquery-qrcode/jquery.qrcode.min.js',
              './nmr-simulation/**',
              './js-yaml/dist/**',
              './canvg/dist/**',
              './eventEmitter/*.js',
            ],
            dest: './build/components/',
          },
          {
            expand: true,
            cwd: './node_modules',
            src: [
              './angularplasmid/dist/**',
              './jquery/dist/*',
              [
                './jquery.fancytree/dist/modules/jquery.fancytree*.js',
                './jquery.fancytree/dist/skin-lion/*',
              ],
              ['./jquery-ui/dist/*.js', './jquery-ui/themes/base/**'],
              './jsbarcode/dist/*.js',
              './jsoneditor/dist/**',
              './jquery-migrate/dist/*',
              './katex/dist/**',
              [
                './leaflet/dist/**',
                './@mapbox/leaflet-omnivore/leaflet-omnivore.min.js',
              ],
              './marked/lib/marked.js',
              './mathjs/lib/browser/**',
              './moment/moment.js',
              './moment-duration-format/lib/moment-duration-format.js',
              './numeral/min/numeral.min.js',
              './openchemlib/dist/**',
              './papaparse/papaparse*',
              './pouchdb/dist/**',
              [
                './quill/dist/*.js*',
                './quill/dist/*.css',
                './quill-resize-module/dist/resize.*',
                './quill-table-better/dist/quill-table-better.*',
              ],
              './requirejs/require.js',
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
            filter(filePath) {
              var files = grunt.option('filterFiles');
              for (let i = 0, l = files.length; i < l; i++) {
                if (path.relative(mapPath(files[i]), filePath) === '') {
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
            filter(filepath) {
              var modulesStack = grunt.option('modulesStack');
              filepath = filepath.replaceAll('\\', '/');
              for (const i in modulesStack) {
                if (filepath.includes(i.slice(4))) {
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
            filter(filepath) {
              var modulesStack = grunt.option('modulesStack');
              filepath = filepath.replaceAll('\\', '/');
              for (const i in modulesStack) {
                if (filepath.includes(i)) {
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
        filter(filepath) {
          return !filepath.match('/lib/') && !filepath.match(/folder\.json$/);
        },
      },

      modulesJsonErase: {
        src: ['src/modules/**/*.json'],
        filter(filepath) {
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
              exclude: ['lodash'],
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

  grunt.registerTask('manifest:generate', function () {
    var files = recursivelyLookupDirectory('build', true);
    fs.writeFileSync('build/cache.appcache', 'CACHE MANIFEST\n\nCACHE:\n\n');
    for (let i = 0; i < files.length; i++) {
      fs.appendFileSync('build/cache.appcache', `${files[i]}\n`);
    }
    fs.appendFileSync('build/cache.appcache', '\n\nNETWORK:\n*\n');

    enableManifest('build/index.html', 'cache.appcache');
  });

  function enableManifest(file, manifest) {
    var content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      '<html>',
      `<html manifest="${manifest || 'cache.appcache'}">`,
    );
    fs.writeFileSync(file, content);
  }

  function recursivelyLookupDirectory(path, asCwd) {
    let relPath;
    const cd = process.cwd();
    if (asCwd) {
      process.chdir(`${process.cwd()}/${path}`);
      relPath = '.';
    } else {
      relPath = path;
    }
    const files = [];
    const options = {
      listeners: {
        file(root, fileStats, next) {
          let p;
          if (root === '.') {
            p = fileStats.name;
          } else if (root.slice(0, 2) === './') {
            p = `${root.slice(2)}/${fileStats.name}`;
          } else {
            p = `${root}/${fileStats.name}`;
          }
          files.push(p);
          next();
        },
        errors(root, nodeStatsArray, next) {
          console.log('An error occured in walk', root, nodeStatsArray);
          next();
        },
      },
    };
    walk.walkSync(relPath, options);
    process.chdir(cd);
    return files;
  }

  const buildTasks = [
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

  grunt.registerTask('buildProject', 'Build project', function () {
    if (!fs.existsSync('./build/')) {
      fs.mkdirSync('build/');
    }

    const modulesStack = {};
    grunt.option('modulesStack', modulesStack);

    const config = grunt.option('config') || './src/usr/config/default.json';

    if (!fs.existsSync(config)) {
      console.log(`File config (${config}) does not exist`);
      return;
    }

    const cfg = grunt.file.readJSON(config);
    const modules = {};
    let modulesFinal = {};

    const usrDir = cfg.usrDir || 'usr';
    cfg.usrDir = 'usr'; // after the build, it will be in usr

    function oldLoadFile() {
      let fileName;
      if (typeof arguments[0] === 'object') {
        fileName = arguments[0];
      } else if (arguments.length === 1) {
        fileName = `./src/${arguments[0]}`;
      } else {
        fileName = arguments[1] + arguments[0];
      }
      let file;
      const jsonStructure = { modules: [], folders: {} };
      if (typeof fileName !== 'object') {
        if (!fs.existsSync(fileName)) {
          if (arguments.length === 1) {
            console.log('arguments[0]', arguments[0]);
            // Not a very neat fix but whatever
            const pos = arguments[0].search('usr');
            if (pos > -1) {
              console.log('new :', arguments[0].slice(pos + 1));
              arguments[0] = arguments[0].slice(pos + 1);
            }
            return oldLoadFile(arguments[0], `${usrPath}/`);
          }
          console.log(`Folder file ${fileName} does not exist`);
          return;
        }
        file = grunt.file.readJSON(fileName);
      } else {
        file = fileName;
      }

      for (const k in file.folders) {
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
      }

      if (file.modules) {
        for (let j = 0, l = file.modules.length; j < l; j++) {
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
        path = usrDir + path.slice(3);
      }
      return `./src/${path}`;
    }

    function loadFile(fileName) {
      let file;
      const jsonStructure = { modules: [], folders: {} };
      if (typeof fileName === 'string') {
        if (!fs.existsSync(fileName)) {
          return console.log(`Folder file ${fileName} does not exist`);
        }
        file = grunt.file.readJSON(`${fileName}/folder.json`);
      } else {
        file = fileName;
      }

      jsonStructure.name = file.name;
      if (file.folders && Array.isArray(file.folders)) {
        for (let i = 0; i < file.folders.length; i++) {
          const res = loadFile(`${fileName}/${file.folders[i]}`);
          jsonStructure.folders[res.name] = res;
        }
      }

      if (file.modules) {
        for (let j = 0, l = file.modules.length; j < l; j++) {
          modules[file.modules[j].url] = true;
          modulesStack[file.modules[j].url] = true;
          jsonStructure.modules.push(file.modules[j]);
        }
      }
      return jsonStructure;
    }

    if (cfg.modules) {
      if (Array.isArray(cfg.modules)) {
        // Backwards compatibility
        for (let i = 0; i < cfg.modules.length; i++) {
          if (typeof cfg.modules[i] == 'object') {
            extend(true, modulesFinal, oldLoadFile(cfg.modules[i]));
          } else {
            extend(true, modulesFinal, oldLoadFile(cfg.modules[i]));
          }
        }
      } else if (Array.isArray(cfg.modules.folders)) {
        const list = cfg.modules;
        if (list.modules) {
          modulesFinal.modules = [];
          for (let j = 0; j < list.modules.length; j++) {
            modules[list.modules[j].url] = true;
            modulesStack[list.modules[j].url] = true;
            modulesFinal.modules.push(list.modules[j]);
          }
        }
        modulesFinal.folders = {};
        for (let i = 0; i < list.folders.length; i++) {
          extend(true, modulesFinal, loadFile(getRealPath(list.folders[i])));
        }
      } else {
        modulesFinal = loadFile(cfg.modules);
      }
    }

    /* Find filter files from the config.json and puts them in an option */
    const filterFiles = [];
    for (const i in cfg.filters) {
      filterFiles.push(cfg.filters[i].file);
    }
    grunt.option('filterFiles', filterFiles);

    cfg.modules = modulesFinal;

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
  });

  // Takes care of module jsons
  grunt.registerTask('eraseModuleJsons', ['clean:modulesJsonErase']);
  grunt.registerTask(
    'createJSONModules',
    'Create all modules json',
    function () {
      recurseFolder('./src/modules/types', 'modules/types');
      recurseFolder('./src/usr/modules', 'usr/modules');
    },
  );

  grunt.registerTask('recurseFolder', 'Recurse Folder', function () {
    const from = grunt.option('recurseFolderFrom');
    const to = grunt.option('recurseFolderTo');

    if (from && to) {
      recurseFolder(from, to);
    }
  });

  function recurseFolder(basePath, relPath) {
    const folders = fs.readdirSync(basePath);
    const allFolders = [];
    const allModules = [];
    let containsModule = false;
    let target = {};

    for (let i = 0; i < folders.length; i++) {
      if (
        !fs.statSync(`${basePath}/${folders[i]}`).isDirectory() ||
        folders[i] === 'lib'
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

    if (allFolders.length === 0 && allModules.length === 0) {
      return;
    }

    target.modules = [];
    for (let i = 0; i < allModules.length; i++) {
      let moduleInfo = /moduleInformation[^{]+(\{[^}]+})/.exec(
        grunt.file.read(`${basePath}/${allModules[i]}/controller.js`),
      );

      try {
        eval(`moduleInfo = ${moduleInfo[1]}`);
      } catch {
        throw new Error(
          `Could not find module information for ${basePath}/${allModules[i]}`,
        );
      }

      const info = {
        moduleName: moduleInfo.name || allModules[i],
        url: `${relPath}/${allModules[i]}/`,
      };

      if (moduleInfo.hidden) {
        info.hidden = true;
      }

      target.modules.push(info);
    }

    target.folders = [];
    for (let i = 0; i < allFolders.length; i++) {
      recurseFolder(
        `${basePath}/${allFolders[i]}`,
        `${relPath}/${allFolders[i]}`,
      );

      if (fs.existsSync(`${basePath}/${allFolders[i]}/folder.json`)) {
        target.folders.push(allFolders[i]);
      }
    }

    if (fs.existsSync(`${basePath}/folder.json`)) {
      const json = grunt.file.readJSON(`${basePath}/folder.json`);
      json.folders = target.folders;
      json.modules = target.modules;

      target = json;
    } else {
      target.name = basePath.split('/').pop();
    }

    target.modules.sort(function (module1, module2) {
      return module1.moduleName
        .toLowerCase()
        .localeCompare(module2.moduleName.toLowerCase());
    });

    fs.writeFileSync(
      `${basePath}/folder.json`,
      JSON.stringify(target, null, 2),
    );
  }

  grunt.registerTask('bump', function (version) {
    const done = this.async();

    let versionJS = fs.readFileSync('./src/version.js', 'utf8');

    const major = getVersionValue(versionJS, 'MAJOR');
    const minor = getVersionValue(versionJS, 'MINOR');
    const patch = getVersionValue(versionJS, 'PATCH');
    const prerelease = getVersionValue(versionJS, 'PRERELEASE');

    let v = `${major}.${minor}.${patch}`;
    if (prerelease !== 'false') {
      v += `-${prerelease}`;
    }

    const semVersion = semver.parse(v);

    console.log(`Current version is ${semVersion}`);

    semVersion.inc(version || 'patch');

    console.log(`Bumping to ${semVersion}`);

    versionJS = setVersionValue(versionJS, 'MAJOR', semVersion.major);
    versionJS = setVersionValue(versionJS, 'MINOR', semVersion.minor);
    versionJS = setVersionValue(versionJS, 'PATCH', semVersion.patch);
    versionJS = setVersionValue(
      versionJS,
      'PRERELEASE',
      semVersion.prerelease.length > 0 ? semVersion.prerelease[0] : 'false',
    );

    if (grunt.option('release')) {
      // Set IS_RELEASE flag to true
      versionJS = setVersionValue(versionJS, 'IS_RELEASE', 'true');
      fs.writeFileSync('./src/version.js', versionJS);

      // Bump version in package.json
      let pkg = fs.readFileSync('./package.json', 'utf8');
      pkg = pkg.replace(/"version": ".+",/, `"version": "${semVersion}",`);
      fs.writeFileSync('./package.json', pkg);

      // Bump version in bower.json
      let bower = fs.readFileSync('./bower.json', 'utf8');
      bower = bower.replace(/"version": ".+",/, `"version": "${semVersion}",`);
      fs.writeFileSync('./bower.json', bower);

      console.log('Writing changelog');
      const changelogStream = changelog({
        preset: 'angular',
      });
      const tmp = tempfile();

      changelogStream
        .pipe(addStream(fs.createReadStream('History.md')))
        .pipe(fs.createWriteStream(tmp))
        .on('finish', function () {
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
        semVersion.prerelease.length > 0 ? semVersion.prerelease[0] : 'false',
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

  grunt.registerTask('buildTime', function (setting) {
    let versionJS = fs.readFileSync('./src/version.js', 'utf8');
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

  grunt.registerTask('css:modules', function () {
    const folderJson = JSON.parse(
      fs.readFileSync('./build/modules/types/folder.json'),
    );
    const mIds = applyModules(folderJson, moduleProcessCss).filter(
      function (v) {
        return v !== undefined;
      },
    );
    const versionJS = fs.readFileSync('./build/version.js', 'utf8');
    const newVersionJS = setVersionValue(
      versionJS,
      'INCLUDED_MODULE_CSS',
      JSON.stringify(mIds),
    );
    fs.writeFileSync('./build/version.js', newVersionJS);
  });

  function applyModules(folderJson, callback) {
    let res = [];
    if (Array.isArray(folderJson)) {
      for (let i = 0; i < folderJson.length; i++) {
        const el = folderJson[i];
        res = res.concat(applyModules(el, callback));
      }
    } else if (typeof folderJson === 'object') {
      for (const key in folderJson) {
        if (key === 'modules' && Array.isArray(folderJson[key])) {
          for (let i = 0; i < folderJson[key].length; i++) {
            const obj = folderJson[key][i];
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
    const p = path.join('./build/', module.url, 'style.css');
    if (module.url && fs.existsSync(p)) {
      append(p, './build/css/main.css');
      return moduleIdFromUrl(module.url);
    }
    return undefined;
  }

  function moduleIdFromUrl(url) {
    const reg = /([^/]+)(\/)?$/;
    const res = url.match(reg);
    return res[1];
  }

  function append(src, dest) {
    fs.appendFileSync(dest, `\n${fs.readFileSync(src)}`);
  }
};
