var path = require('path');
var execFile = require('child_process').execFile;
var packagejson = require('./package.json');
var electron = require('electron-prebuilt');

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    var target = grunt.option('target') || 'development';
    var beta = grunt.option('beta') || false;
    var alpha = grunt.option('alpha') || false;
    var env = process.env;
    env.NODE_PATH = '..:' + env.NODE_PATH;
    env.NODE_ENV = target;

    var version = function(str) {
        var match = str.match(/(\d+\.\d+\.\d+)/);
        return match ? match[1] : null;
    };

    var BASENAME = 'ΛLΞXΛNDRIΛ Librarian';
    var APPNAME = BASENAME;

    if (alpha) {
        APPNAME += ' (Alpha)';
    } else if (beta) {
        APPNAME += ' (Beta)';
    }

    var OSX_OUT = './dist';
    var OSX_OUT_X64 = OSX_OUT + '/' + APPNAME + '-darwin-x64';
    var OSX_FILENAME = OSX_OUT_X64 + '/' + APPNAME + '.app';

    var OSX_DIST_X64 = OSX_OUT + '/' + APPNAME + '-' + packagejson.version + '.pkg';

    grunt.initConfig({
        IDENTITY: 'Developer ID Application: Luigi Poole',
        APPNAME: APPNAME,
        APPNAME_ESCAPED: APPNAME.replace(/ /g, '\\ ').replace(/\(/g, '\\(').replace(/\)/g, '\\)'),
        OSX_OUT: OSX_OUT,
        OSX_OUT_ESCAPED: OSX_OUT.replace(/ /g, '\\ ').replace(/\(/g, '\\(').replace(/\)/g, '\\)'),
        OSX_OUT_X64: OSX_OUT_X64,
        OSX_FILENAME: OSX_FILENAME,
        OSX_FILENAME_ESCAPED: OSX_FILENAME.replace(/ /g, '\\ ').replace(/\(/g, '\\(').replace(/\)/g, '\\)'),
        OSX_DIST_X64: OSX_DIST_X64,
        OSX_DIST_X64_ESCAPED: OSX_DIST_X64.replace(/ /g, '\\ ').replace(/\(/g, '\\(').replace(/\)/g, '\\)'),
        // electron
        electron: {
            windows: {
                options: {
                    name: BASENAME,
                    dir: 'build/',
                    out: 'dist',
                    version: packagejson['electron-version'],
                    platform: 'win32',
                    arch: 'ia32',
                    asar: true
                }
            },
            osx: {
                options: {
                    name: APPNAME,
                    dir: 'build/',
                    out: 'dist',
                    version: packagejson['electron-version'],
                    platform: 'darwin',
                    arch: 'x64',
                    asar: true,
                    'app-bundle-id': 'io.ΛLΞXΛNDRIΛ.Librarian',
                    'app-version': packagejson.version
                }
            }
        },


        rcedit: {
            exes: {
                files: [{
                    expand: true,
                    cwd: 'dist/' + BASENAME + '-win32-ia32',
                    src: [BASENAME + '.exe']
                }],
                options: {
                    'file-version': packagejson.version,
                    'product-version': packagejson.version,
                    'version-string': {
                        'CompanyName': 'ΛLΞXΛNDRIΛ',
                        'ProductVersion': packagejson.version,
                        'ProductName': APPNAME,
                        'FileDescription': APPNAME,
                        'InternalName': BASENAME + '.exe',
                        'OriginalFilename': BASENAME + '.exe',
                        'LegalCopyright': 'Copyright 2015 ΛLΞXΛNDRIΛ Limited. All rights reserved.'
                    }
                }
            }
        },

        'create-windows-installer': {
            config: {
                appDirectory: path.join(__dirname, 'dist/' + BASENAME + '-win32-ia32'),
                outputDirectory: path.join(__dirname, 'dist'),
                authors: 'ΛLΞXΛNDRIΛ Limited',
                loadingGif: 'images/loading.gif',
                setupIcon: 'images/icons/setup.ico',
                iconUrl: 'https://raw.githubusercontent.com/dloa/alexandria-librarian/master/util/alexandria-librarian.ico',
                description: APPNAME,
                title: APPNAME,
                exe: BASENAME + '.exe',
                version: packagejson.version
            }
        },

        // images
        copy: {
            dev: {
                files: [{
                    expand: true,
                    cwd: '.',
                    src: ['LICENSE.md', 'package.json', 'settings.json', 'index.html'],
                    dest: 'build/'
                }, {
                    expand: true,
                    cwd: 'images/',
                    src: ['**/*'],
                    dest: 'build/images/'
                }, {
                    expand: true,
                    cwd: 'bin/',
                    src: ['**/*'],
                    dest: 'build/bin/'
                }, {
                    expand: true,
                    cwd: 'fonts/',
                    src: ['**/*'],
                    dest: 'build/fonts/'
                }, {
                    cwd: 'node_modules/',
                    src: Object.keys(packagejson.dependencies).map(function(dep) {
                        return dep + '/**/*';
                    }),
                    dest: 'build/node_modules/',
                    expand: true
                }]
            },
            osx: {
                files: [{
                    src: 'util/alexandria_logo_grey_pyramid.icns',
                    dest: '<%= OSX_FILENAME %>/Contents/Resources/atom.icns'
                }],
                options: {
                    mode: true
                }
            }
        },

        rename: {
            installer: {
                src: 'dist/Setup.exe',
                dest: 'dist/' + BASENAME + 'Setup-' + packagejson.version + '-Windows-Alpha.exe'
            }
        },

        // styles
        less: {
            options: {
                sourceMapFileInline: true
            },
            dist: {
                files: {
                    'build/css/main.css': 'styles/main.less'
                }
            }
        },

        // javascript
        babel: {
            options: {
                sourceMap: 'inline',
                blacklist: 'regenerator'
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**/*.js'],
                    dest: 'build/js',
                }]
            }
        },

        shell: {
            electron: {
                command: electron + ' .',
                options: {
                    async: true,
                    execOptions: {
                        env: env,
                        cwd: 'build'
                    }
                }
            },
            macdist: {
                options: {
                    failOnError: false,
                },
                command: [
                    'util/mac/mac-dist',
                    'codesign -v -f -s "<%= IDENTITY %>" <%= OSX_DIST_X64 %>',
                    'codesign -vvv --display <%= OSX_DIST_X64 %>',
                    'codesign -v --verify <%= OSX_DIST_X64 %>'
                ].join(' && '),
            },
            zip: {
                command: 'ditto -c -k --sequesterRsrc --keepParent <%= OSX_FILENAME_ESCAPED %> dist/' + BASENAME + '-' + packagejson.version + '-Mac.zip',
            }
        },

        clean: {
            release: ['build/', 'dist/'],
        },

        compress: {
            windows: {
                options: {
                    archive: './dist/' + BASENAME + '-' + packagejson.version + '-Windows-Alpha.zip',
                    mode: 'zip'
                },
                files: [{
                    expand: true,
                    dot: true,
                    cwd: './dist/ΛLΞXΛNDRIΛ-win32-ia32',
                    src: '**/*'
                }]
            },
        },

        // livereload
        watchChokidar: {
            options: {
                spawn: true
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: ['build/**/*']
            },
            js: {
                files: ['src/**/*.js'],
                tasks: ['newer:babel']
            },
            less: {
                files: ['styles/**/*.less'],
                tasks: ['less']
            },
            copy: {
                files: ['images/*', 'index.html', 'fonts/*'],
                tasks: ['newer:copy:dev']
            }
        }
    });

    grunt.registerTask('default', ['newer:babel', 'less', 'newer:copy:dev', 'shell:electron', 'watchChokidar']);

    if (process.platform === 'win32') {
        grunt.registerTask('release', ['clean:release', 'babel', 'less', 'copy:dev', 'electron:windows', 'compress']);
    } else {
        grunt.registerTask('release', ['clean:release', 'babel', 'less', 'copy:dev', 'electron:osx', 'copy:osx', 'shell:zip']);
    }

    process.on('SIGINT', function() {
        grunt.task.run(['shell:electron:kill']);
        process.exit(1);
    });
};